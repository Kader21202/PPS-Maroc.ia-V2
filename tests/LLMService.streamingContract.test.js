"use strict";

const assert = require("assert");

const {
  LLMService
} = require(
  "../src/services/LLMService"
);

class InvalidStreamingProvider {
  async invoke() {
    return {
      provider: "fake",
      content: "OK"
    };
  }

  getCapabilities() {
    return {
      streaming: true,

      requestLimits: {
        maxInputTokens: null,
        maxOutputTokens: null,
        maxRequestsPerMinute: null,
        maxTokensPerMinute: null
      }
    };
  }

  // Intentionally no stream().
}

class FakePromptBuilder {
  build() {
    return {
      systemPrompt: "System prompt",
      userPrompt: "User prompt",
      metadata: {}
    };
  }
}

(async () => {
  const service =
    new LLMService(
      new InvalidStreamingProvider(),
      new FakePromptBuilder()
    );

  let error = null;

  try {
    await service.expressStream(
      {
        answer: "Réponse"
      },
      () => {}
    );
  } catch (caught) {
    error = caught;
  }

  assert.ok(
    error,
    "LLMService must reject an inconsistent streaming provider."
  );

  assert.match(
    error.message,
    /declares streaming support but does not implement stream/i
  );

  console.log(
    "LLMService.streamingContract.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
