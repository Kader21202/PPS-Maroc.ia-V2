"use strict";

const assert = require("assert");

const {
  PromptRequestExecutor
} = require(
  "../src/services/PromptRequestExecutor"
);

class FakeProvider {
  constructor() {
    this.invokeCalled = false;
  }

  getCapabilities() {
    return {
      streaming: false,
      requestCapacity: {
        maxInputTokens: 8000,
        maxOutputTokens: null
      },
      rateLimits: {
        maxRequestsPerMinute: null,
        maxTokensPerMinute: null
      }
    };
  }

  async invoke(promptRequest) {
    this.invokeCalled = true;

    return {
      provider: "fake",
      content: "DIRECT",
      promptRequest
    };
  }
}

class UnknownMeasurer {
  constructor() {
    this.measureCalled = false;
  }

  measure() {
    this.measureCalled = true;

    return {
      inputTokens: null,
      characters: 10000,
      measurementMethod: "characters",
      exact: false
    };
  }
}

(async () => {
  const provider =
    new FakeProvider();

  const measurer =
    new UnknownMeasurer();

  const executor =
    new PromptRequestExecutor({
      measurer
    });

  const promptRequest = {
    systemPrompt: "System",
    userPrompt: "User",
    metadata: {}
  };

  const result =
    await executor.execute({
      promptRequest,
      finalAnswer: {
        answer: "Answer"
      },
      provider
    });

  assert.strictEqual(
    measurer.measureCalled,
    true,
    "PromptRequestExecutor must measure the PromptRequest before admission."
  );

  assert.strictEqual(
    provider.invokeCalled,
    true,
    "UNKNOWN admission must preserve the direct provider path."
  );

  assert.strictEqual(
    result.content,
    "DIRECT"
  );

  console.log(
    "PromptRequestExecutor.unknownAdmission.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
