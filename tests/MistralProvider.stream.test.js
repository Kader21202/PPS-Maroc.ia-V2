"use strict";

const assert = require("assert");

const {
  MistralProvider
} = require("../src/providers/MistralProvider");

function createStreamingResponse(events) {
  const encoder = new TextEncoder();

  const body = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(
          encoder.encode(event)
        );
      }

      controller.close();
    }
  });

  return {
    ok: true,
    status: 200,
    statusText: "OK",
    body
  };
}

(async () => {
  const originalFetch = global.fetch;

  let capturedRequest = null;

  global.fetch = async (url, options) => {
    capturedRequest = {
      url,
      options
    };

    return createStreamingResponse([
      'data: {"choices":[{"delta":{"content":"Bonjour "}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"camarade"}}]}\n\n',
      "data: [DONE]\n\n"
    ]);
  };

  try {
    const provider = new MistralProvider({
      apiKey: "test-api-key",
      model: "mistral-test",
      temperature: 0.2
    });

    const receivedChunks = [];

    const result = await provider.stream(
      {
        systemPrompt: "System prompt",
        userPrompt: "User prompt",
        metadata: {
          test: true
        }
      },
      (chunk) => {
        receivedChunks.push(chunk);
      }
    );

    assert.ok(capturedRequest);

    assert.strictEqual(
      capturedRequest.url,
      "https://api.mistral.ai/v1/chat/completions"
    );

    const requestBody = JSON.parse(
      capturedRequest.options.body
    );

    assert.strictEqual(
      requestBody.stream,
      true
    );

    assert.deepStrictEqual(
      receivedChunks,
      [
        "Bonjour ",
        "camarade"
      ]
    );

    assert.strictEqual(
      result.provider,
      "mistral"
    );

    assert.strictEqual(
      result.model,
      "mistral-test"
    );

    assert.strictEqual(
      result.content,
      "Bonjour camarade"
    );

    assert.strictEqual(
      result.metadata.test,
      true
    );

    console.log(
      "✅ MistralProvider streaming validé"
    );
  } finally {
    global.fetch = originalFetch;
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
