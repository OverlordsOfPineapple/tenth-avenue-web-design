#!/usr/bin/env node

import process from "node:process";
import { resolveAny, resolveNs } from "node:dns/promises";

const siteUrl = (process.env.SITE_URL || "https://tenthavenuewebdesign.com").replace(/\/+$/, "");
const siteHost = new URL(siteUrl).hostname;
const previewUrl = (process.env.PREVIEW_URL || "https://tenth-avenue-web-design.pages.dev").replace(/\/+$/, "");
const testForm = process.env.TEST_FORM === "1";
const routes = ["/", "/services", "/portfolio", "/about", "/process", "/contact", "/privacy", "/terms"];

async function fetchWithRetry(url, options = {}, attempts = 8) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
        ...options,
      });

      if (response.status < 500) return response;
      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(attempt * 2500, 12_000)));
    }
  }

  throw lastError;
}

const dnsResults = await Promise.allSettled([resolveAny(siteHost), resolveNs(siteHost)]);
if (dnsResults.every((result) => result.status === "rejected")) {
  throw new Error(`${siteHost} does not currently resolve in public DNS.`);
}
console.log(`✓ DNS resolves for ${siteHost}`);

for (const route of routes) {
  const response = await fetchWithRetry(`${siteUrl}${route}`);
  if (!response.ok) throw new Error(`${route} returned HTTP ${response.status}`);

  const html = await response.text();
  const expectedCanonical = route === "/" ? `${siteUrl}/` : `${siteUrl}${route}`;
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];

  if (canonical && canonical.replace(/\/$/, "") !== expectedCanonical.replace(/\/$/, "")) {
    throw new Error(`${route} canonical is ${canonical}; expected ${expectedCanonical}`);
  }

  if (html.includes("tenth-avenue-web-design.pages.dev")) {
    throw new Error(`${route} still exposes the preview origin in production HTML.`);
  }

  console.log(`✓ ${route}`);
}

const robots = await (await fetchWithRetry(`${siteUrl}/robots.txt`)).text();
if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
  throw new Error("robots.txt does not reference the production sitemap.");
}
console.log("✓ robots.txt");

const sitemap = await (await fetchWithRetry(`${siteUrl}/sitemap.xml`)).text();
if (!sitemap.includes(`${siteUrl}/`) || sitemap.includes("tenth-avenue-web-design.pages.dev")) {
  throw new Error("sitemap.xml does not exclusively use the production origin.");
}
console.log("✓ sitemap.xml");

try {
  const preview = await fetch(previewUrl, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  const location = preview.headers.get("location") || "";
  if (preview.status >= 300 && preview.status < 400 && location.startsWith(siteUrl)) {
    console.log("✓ Cloudflare preview host redirects to the production domain");
  } else {
    console.warn("! Preview host is still directly accessible; enable the canonical-host middleware after the custom domain is active.");
  }
} catch {
  console.warn("! Preview-host redirect check could not be completed.");
}

if (testForm) {
  const response = await fetchWithRetry(`${siteUrl}/api/contact`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "Tenth-Avenue-Launch-Smoke-Test/1.0",
    },
    body: JSON.stringify({
      name: "Launch Smoke Test",
      email: "keithrockliffe@gmail.com",
      phone: "",
      business: "Tenth Avenue Web Design",
      message: `Automated production verification at ${new Date().toISOString()}. This synthetic lead may be deleted.`,
      website: "",
    }),
  });

  const body = await response.text();
  if (response.status !== 201) {
    throw new Error(`Contact API test failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
  }

  const parsed = JSON.parse(body);
  if (!parsed.ok || !parsed.leadId) {
    throw new Error(`Contact API returned an unexpected response: ${body.slice(0, 500)}`);
  }

  console.log(`✓ Contact API stored synthetic lead ${parsed.leadId}`);
}

console.log(`\nLIVE AND VERIFIED: ${siteUrl}`);
