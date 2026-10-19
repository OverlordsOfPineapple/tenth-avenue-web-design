import assert from "node:assert/strict";
import { parseRequest } from "../functions/_shared.js";
import { onRequest as canonicalMiddleware } from "../functions/_middleware.js";

async function responseJson(response) {
  return response.json();
}

const getResult = await parseRequest(
  new Request("https://example.test/api/contact", { method: "GET" }),
  "contact",
);
assert.equal(getResult.error.status, 405);

const invalidJson = await parseRequest(
  new Request("https://example.test/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  }),
  "contact",
);
assert.equal(invalidJson.error.status, 400);

const spam = await parseRequest(
  new Request("https://example.test/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      website: "https://spam.example",
      name: "Bot",
      email: "bot@example.test",
      message: "spam",
    }),
  }),
  "contact",
);
assert.equal(spam.error.status, 201);
assert.equal((await responseJson(spam.error)).ok, true);

const valid = await parseRequest(
  new Request("https://example.test/api/quote", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "test" },
    body: JSON.stringify({
      name: "Test Person",
      email: "test@example.com",
      phone: "0400000000",
      business: "Test Business",
      details: "A useful project brief.",
    }),
  }),
  "quote",
);
assert.equal(valid.lead.type, "quote");
assert.equal(valid.lead.name, "Test Person");
assert.equal(valid.lead.message, "A useful project brief.");

console.log("Function request tests passed.");

const middlewareCtx = (url, env = {}, method = "GET") => ({
  request: new Request(url, {
    method,
    ...(method === "POST" ? {
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ synthetic: true }),
    } : {}),
  }),
  env,
  next() { return new Response("continued", { status: 200 }); },
});

const wwwRedirect = await canonicalMiddleware(middlewareCtx(
  "https://www.tenthavenuewebdesign.com/process?utm_source=testing",
));
assert.equal(wwwRedirect.status, 308, "www redirects without requiring an env flag");
assert.equal(
  wwwRedirect.headers.get("location"),
  "https://tenthavenuewebdesign.com/process?utm_source=testing",
);

const postRedirect = await canonicalMiddleware(middlewareCtx(
  "https://www.tenthavenuewebdesign.com/api/contact", {}, "POST",
));
assert.equal(postRedirect.status, 308, "POST requests are method-preserving redirects");

const apex = await canonicalMiddleware(middlewareCtx("https://tenthavenuewebdesign.com/contact"));
assert.equal(apex.status, 200, "apex requests pass through");

const branchPreview = await canonicalMiddleware(middlewareCtx(
  "https://design-example.tenth-avenue-web-design.pages.dev/about",
));
assert.equal(branchPreview.status, 200, "branch preview remains accessible");

const preview = await canonicalMiddleware(middlewareCtx(
  "https://tenth-avenue-web-design.pages.dev/contact",
  { ENFORCE_CANONICAL_HOST: "true" },
));
assert.equal(preview.status, 308, "optional production preview redirect works");
assert.equal(
  preview.headers.get("location"),
  "https://tenthavenuewebdesign.com/contact",
);

console.log("Canonical-host middleware tests passed.");
