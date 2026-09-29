"use strict";

const assert = require("assert");

const {
  GroqProvider
} = require("../src/providers/GroqProvider");

(async () => {
  // 1. Missing API key
  assert.throws(
    () =>
      new GroqProvider({
        apiKey: ""
      }),
    /GROQ_API_KEY/
  );

  const provider =
    new GroqProvider({
      apiKey: "test-key",
      model: "test-model"
    });

  // 2. Invalid prompt request
  await assert.rejects(
    () => provider.invoke(null),
    /Prompt request must be an object/
  );

  await assert.rejects(
    () =>
      provider.invoke({
        systemPrompt: "",
        userPrompt: "Question"
      }),
    /System prompt cannot be empty/
  );

  await assert.rejects(
    () =>
      provider.invoke({
        systemPrompt: "System",
        userPrompt: ""
      }),
    /User prompt cannot be empty/
  );

  const originalFetch = global.fetch;

  try {
    // 3. HTTP/API failure
    global.fetch = async () => ({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",

      async text() {
        return "rate limit";
      }
    });

    await assert.rejects(
      () =>
        provider.invoke({
          systemPrompt: "System",
          userPrompt: "Question"
        }),
      /Groq API error: 429 Too Many Requests - rate limit/
    );

    // 4. Empty provider response
    global.fetch = async () => ({
      ok: true,
      status: 200,
      statusText: "OK",

      async json() {
        return {
          choices: [
            {
              message: {
                content: "   "
              }
            }
          ]
        };
      }
    });

    await assert.rejects(
      () =>
        provider.invoke({
          systemPrompt: "System",
          userPrompt: "Question"
        }),
      /Groq API returned an empty response/
    );

    console.log(
      "GroqProvider.errors.test.js: PASS"
    );
  } finally {
    global.fetch = originalFetch;
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
