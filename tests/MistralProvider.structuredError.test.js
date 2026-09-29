"use strict";

const assert = require("assert");

const {
  MistralProvider
} = require(
  "../src/providers/MistralProvider"
);

(async () => {
  const provider =
    new MistralProvider({
      apiKey: "test-key",
      model: "test-model"
    });

  const originalFetch =
    global.fetch;

  try {
    global.fetch =
      async () => ({
        ok: false,
        status: 429,
        statusText:
          "Too Many Requests",

        headers: {
          get(name) {
            if (
              String(name).toLowerCase() ===
              "retry-after"
            ) {
              return "15";
            }

            return null;
          }
        },

        async text() {
          return JSON.stringify({
            message:
              "rate limit exceeded"
          });
        }
      });

    let capturedError = null;

    try {
      await provider.invoke({
        systemPrompt: "System",
        userPrompt: "Question"
      });
    } catch (error) {
      capturedError = error;
    }

    assert.ok(
      capturedError,
      "Provider must propagate an error."
    );

    assert.strictEqual(
      capturedError.status,
      429,
      "Provider error must preserve HTTP status."
    );

    assert.strictEqual(
      capturedError.statusText,
      "Too Many Requests",
      "Provider error must preserve HTTP status text."
    );

    assert.strictEqual(
      capturedError.provider,
      "mistral",
      "Provider error must preserve provider identity."
    );

    assert.strictEqual(
      capturedError.retryAfter,
      "15",
      "Provider error must preserve Retry-After when available."
    );

    assert.ok(
      typeof capturedError.body === "string" &&
      capturedError.body.includes(
        "rate limit exceeded"
      ),
      "Provider error must preserve the response body."
    );

    console.log(
      "MistralProvider.structuredError.test.js: PASS"
    );
  } finally {
    global.fetch =
      originalFetch;
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
