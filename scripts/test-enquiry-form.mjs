import assert from "node:assert/strict";
import { bindEnquiryForm } from "../frontend/src/enquiry-form.js";

const originalFetch = globalThis.fetch;
const OriginalFormData = globalThis.FormData;
try {
  globalThis.FormData = class extends Map {
    constructor() { super([["name", "Test"], ["email", "test@example.com"]]); }
  };
  for (const endpoint of ["/api/contact", "/api/quote"]) {
    for (const scenario of ["success", "warning", "server", "malformed", "missing-reference", "network"]) {
      const button = { disabled: false };
      const status = { textContent: "" };
      let submit, resets = 0, busy = false, calls = 0, release;
      const pending = new Promise((resolve) => { release = resolve; });
      const form = {
        addEventListener(event, callback) { assert.equal(event, "submit"); submit = callback; },
        querySelector() { return button; },
        setAttribute(name, value) { assert.equal(name, "aria-busy"); assert.equal(value, "true"); busy = true; },
        removeAttribute(name) { assert.equal(name, "aria-busy"); busy = false; },
        reset() { resets++; },
      };
      globalThis.fetch = async (url, options) => {
        calls++;
        assert.equal(url, endpoint);
        assert.equal(options.method, "POST");
        assert.equal(JSON.parse(options.body).email, "test@example.com");
        await pending;
        if (scenario === "network") throw new Error("Network unavailable");
        return {
          ok: scenario !== "server",
          async json() {
            if (scenario === "malformed") throw new SyntaxError("Bad JSON");
            if (scenario === "missing-reference") return { ok: true };
            if (scenario === "server") return { ok: false, error: "Server failure" };
            return { ok: true, leadId: "LOCAL", message: scenario === "warning" ? "Saved; email failed" : "Received" };
          },
        };
      };
      bindEnquiryForm(form, status, endpoint);
      const event = { preventDefault() {} };
      const submission = submit(event);
      assert.equal(button.disabled, true);
      assert.equal(busy, true);
      await submit(event);
      assert.equal(calls, 1, "Repeated submit must not send a second enquiry");
      release();
      await submission;
      assert.equal(button.disabled, false);
      assert.equal(busy, false);
      const accepted = scenario === "success" || scenario === "warning";
      assert.equal(resets, accepted ? 1 : 0, "Failed submissions must retain entered data");
      assert.match(status.textContent, accepted ? /Reference: LOCAL/ : /Please call/);
      if (scenario === "warning") assert.match(status.textContent, /Saved; email failed/);
    }
  }
  bindEnquiryForm(null, null, "/api/contact");
  console.log("Shared enquiry form tests passed for both endpoints, failures, warnings and duplicate submissions.");
} finally {
  globalThis.fetch = originalFetch;
  globalThis.FormData = OriginalFormData;
}
