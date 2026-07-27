import assert from "node:assert/strict";
import { parseRequest } from "../functions/_shared.js";

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
