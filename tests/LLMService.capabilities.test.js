"use strict";

const assert = require("assert");

const {
  LLMService
} = require(
  "../src/services/LLMService"
);

class CapabilityDisabledProvider {
  constructor() {
    this.streamCalled = false;
  }

  async invoke() {
    return {
      provider: "fake",
      content: "OK"
    };
  }

  getCapabilities() {
    return {
      streaming: false,

      requestLimits: {
        maxInputTokens: null,
        maxOutputTokens: null,
        maxRequestsPerMinute: null,
        maxTokensPerMinute: null
      }
    };
  }

  async stream() {
    this.streamCalled = true;

    throw new Error(
      "stream() must not be called when streaming capability is disabled."
    );
  }
}

class FakePromptBuilder {
  build() {
    return {
      systemPrompt:
        "System prompt",

      userPrompt:
        "User prompt",

      metadata: {}
    };
  }
}

(async () => {
  const provider =
    new CapabilityDisabledProvider();

  const llm =
    new LLMService(
      provider,
      new FakePromptBuilder()
    );

  let error = null;

  try {
    await llm.expressStream(
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
    "LLMService must reject streaming when provider capability is disabled."
  );

  assert.strictEqual(
    provider.streamCalled,
    false,
    "LLMService must not call stream() when streaming capability is disabled."
  );

  assert.match(
    error.message,
    /stream/i
  );

  console.log(
    "LLMService.capabilities.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
