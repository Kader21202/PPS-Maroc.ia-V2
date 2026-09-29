"use strict";

const assert = require("assert");

const {
  GroqProvider
} = require("../src/providers/GroqProvider");

(async () => {
  const originalFetch = global.fetch;

  let capturedUrl = null;
  let capturedOptions = null;

  global.fetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;

    return {
      ok: true,
      status: 200,
      statusText: "OK",

      async json() {
        return {
          choices: [
            {
              message: {
                content: "  Réponse Groq simulée.  "
              }
            }
          ]
        };
      }
    };
  };

  try {
    const provider =
      new GroqProvider({
        apiKey: "test-key",
        model: "test-model",
        temperature: 0.1
      });

    const capabilities =
      provider.getCapabilities();

    assert.strictEqual(
      capabilities.streaming,
      false
    );

    const result =
      await provider.invoke({
        systemPrompt: "System",
        userPrompt: "Question",
        metadata: {
          requestId: "test-request"
        }
      });

    assert.strictEqual(
      capturedUrl,
      "https://api.groq.com/openai/v1/chat/completions"
    );

    assert.strictEqual(
      capturedOptions.method,
      "POST"
    );

    assert.strictEqual(
      capturedOptions.headers.Authorization,
      "Bearer test-key"
    );

    assert.strictEqual(
      capturedOptions.headers["Content-Type"],
      "application/json"
    );

    const body =
      JSON.parse(capturedOptions.body);

    assert.strictEqual(
      body.model,
      "test-model"
    );

    assert.strictEqual(
      body.temperature,
      0.1
    );

    assert.deepStrictEqual(
      body.messages,
      [
        {
          role: "system",
          content: "System"
        },
        {
          role: "user",
          content: "Question"
        }
      ]
    );

    assert.strictEqual(
      result.provider,
      "groq"
    );

    assert.strictEqual(
      result.model,
      "test-model"
    );

    assert.strictEqual(
      result.content,
      "Réponse Groq simulée."
    );

    assert.deepStrictEqual(
      result.metadata,
      {
        requestId: "test-request"
      }
    );

    console.log(
      "GroqProvider.test.js: PASS"
    );
  } finally {
    global.fetch = originalFetch;
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
