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
              return "20";
            }

            return null;
          }
        },

        async text() {
          return JSON.stringify({
            message:
              "stream rate limit exceeded"
          });
        }
      });

    let capturedError = null;

    try {
      await provider.stream(
        {
          systemPrompt: "System",
          userPrompt: "Question"
        },
        () => {}
      );
    } catch (error) {
      capturedError = error;
    }

    assert.ok(
      capturedError,
      "Streaming provider must propagate an error."
    );

    assert.strictEqual(
      capturedError.status,
      429,
      "Streaming error must preserve HTTP status."
    );

    assert.strictEqual(
      capturedError.statusText,
      "Too Many Requests",
      "Streaming error must preserve HTTP status text."
    );

    assert.strictEqual(
      capturedError.provider,
      "mistral",
      "Streaming error must preserve provider identity."
    );

    assert.strictEqual(
      capturedError.retryAfter,
      "20",
      "Streaming error must preserve Retry-After."
    );

    assert.ok(
      typeof capturedError.body === "string" &&
      capturedError.body.includes(
        "stream rate limit exceeded"
      ),
      "Streaming error must preserve response body."
    );

    console.log(
      "MistralProvider.streamingStructuredError.test.js: PASS"
    );
  } finally {
    global.fetch =
      originalFetch;
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
