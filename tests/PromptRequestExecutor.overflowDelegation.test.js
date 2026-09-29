"use strict";

const assert = require("assert");

const {
  PromptRequestExecutor
} = require(
  "../src/services/PromptRequestExecutor"
);

class FakeProvider {
  async invoke() {
    throw new Error(
      "Provider must not be invoked directly for OVER_CAPACITY."
    );
  }

  getCapabilities() {
    return {
      streaming: false,
      requestCapacity: {
        maxInputTokens: 100,
        maxOutputTokens: null
      },
      rateLimits: {
        maxRequestsPerMinute: null,
        maxTokensPerMinute: null
      }
    };
  }
}

class FakeMeasurer {
  measure() {
    return {
      inputTokens: 150,
      measurementMethod: "fake",
      exact: true
    };
  }
}

class FakeAdmission {
  evaluate() {
    return {
      status: "OVER_CAPACITY",
      reason: "INPUT_TOKEN_CAPACITY_EXCEEDED",
      inputTokens: 150,
      maxInputTokens: 100
    };
  }
}

class FakeOverflowHandler {
  constructor() {
    this.called = false;
    this.received = null;
  }

  async execute(context) {
    this.called = true;
    this.received = context;

    return {
      provider: "fake",
      content: "OVERFLOW_HANDLED"
    };
  }
}

(async () => {
  const overflowHandler =
    new FakeOverflowHandler();

  const executor =
    new PromptRequestExecutor({
      measurer: new FakeMeasurer(),
      admission: new FakeAdmission(),
      overflowHandler
    });

  const promptRequest = {
    systemPrompt: "System",
    userPrompt: "User",
    metadata: {}
  };

  const finalAnswer = {
    answer: "Answer"
  };

  const provider =
    new FakeProvider();

  const result =
    await executor.execute({
      promptRequest,
      finalAnswer,
      provider
    });

  assert.strictEqual(
    overflowHandler.called,
    true,
    "OVER_CAPACITY must be delegated to the overflow handler."
  );

  assert.strictEqual(
    overflowHandler.received.promptRequest,
    promptRequest
  );

  assert.strictEqual(
    overflowHandler.received.finalAnswer,
    finalAnswer
  );

  assert.strictEqual(
    overflowHandler.received.provider,
    provider
  );

  assert.strictEqual(
    overflowHandler.received.measurement.inputTokens,
    150
  );

  assert.strictEqual(
    overflowHandler.received.admission.status,
    "OVER_CAPACITY"
  );

  assert.strictEqual(
    result.content,
    "OVERFLOW_HANDLED"
  );

  console.log(
    "PromptRequestExecutor.overflowDelegation.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
