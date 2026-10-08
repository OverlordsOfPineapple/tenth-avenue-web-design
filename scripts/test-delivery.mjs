import assert from "node:assert/strict";
import { handleLead } from "../functions/_shared.js";

const originalFetch = globalThis.fetch;
const originalSetTimeout = globalThis.setTimeout;
const originalError = console.error;
const originalInfo = console.info;
console.error = console.info = () => {};
try {
  for (const type of ["contact", "quote"]) {
    for (const scenario of ["missing", "rejected", "invalid-response", "null-response", "network-error", "timeout", "accepted", "database-failed", "database-rejected"]) {
      globalThis.setTimeout = scenario === "timeout"
        ? (callback, delay) => {
            assert.equal(delay, 10_000, "Email requests have a bounded timeout");
            return originalSetTimeout(callback, 1);
          }
        : originalSetTimeout;
      let saved = 0;
      let calls = 0;
      const DB = { prepare() { return { bind() { return this; }, async first() { return { total: 0 }; }, async run() { saved++; } }; } };
      const env = { DB };
      if (scenario !== "missing") Object.assign(env, {
        RESEND_API_KEY: "test-key", LEAD_TO_EMAIL: "studio@example.test", RESEND_FROM_EMAIL: "forms@example.test"
      });
      if (scenario === "database-failed") env.DB = undefined;
      if (scenario === "database-rejected") env.DB.prepare = () => ({
        bind() { return this; }, async first() { return { total: 0 }; },
        async run() { throw new Error("Database unavailable"); }
      });
      globalThis.fetch = async (url, options) => {
        calls++;
        assert.ok(options.signal instanceof AbortSignal);
        if (scenario === "network-error") throw new TypeError("Network error");
        if (scenario === "timeout") return new Promise((resolve, reject) => {
          options.signal.addEventListener("abort", () => reject(new DOMException("Timed out", "AbortError")), { once: true });
        });
        assert.equal(saved, 1, "Save the enquiry before attempting notification");
        assert.equal(url, "https://api.resend.com/emails");
        const payload = JSON.parse(options.body);
        assert.deepEqual(payload.to, [env.LEAD_TO_EMAIL]);
        assert.equal(payload.reply_to, "test@example.com");
        assert.match(options.headers["idempotency-key"], /^lead\//);
        return new Response(JSON.stringify(scenario === "accepted" ? { id: "test-email" } : scenario === "null-response" ? null : {}),
          { status: scenario === "rejected" ? 403 : 200 });
      };
      const request = new Request(`https://example.test/api/${type}`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Delivery test", email: "test@example.com", message: "Test only" })
      });
      const response = await handleLead({ request, env }, type);
      const body = await response.json();
      if (["database-failed", "database-rejected"].includes(scenario)) {
        assert.equal(response.status, 500);
        assert.equal(body.ok, false);
        assert.equal(calls, 0);
      } else {
        assert.equal(response.status, 201);
        assert.equal(body.ok, true);
        assert.ok(body.leadId);
        assert.equal(saved, 1);
        assert.equal(calls, scenario === "missing" ? 0 : 1);
        assert.equal(body.notification, scenario === "accepted" ? "accepted" : "failed");
        if (scenario !== "accepted") assert.match(body.message, /couldn’t confirm it reached our inbox/);
      }
    }
  }
  console.log("Delivery tests passed for contact and quote: missing settings, rejection, malformed/null acceptance, network error, timeout, acceptance, database failures.");
} finally {
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalSetTimeout;
  console.error = originalError;
  console.info = originalInfo;
}
