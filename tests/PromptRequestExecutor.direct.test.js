"use strict";

const assert = require("assert");

const {
  PromptRequestExecutor
} = require(
  "../src/services/PromptRequestExecutor"
);

class FakeProvider {
  constructor() {
    this.received = null;
  }

  async invoke(promptRequest) {
    this.received = promptRequest;

    return {
      provider: "fake",
      model: "fake-model",
      content: "Réponse directe",
      metadata: promptRequest.metadata
    };
  }
}

(async () => {
  const provider =
    new FakeProvider();

  const executor =
    new PromptRequestExecutor();

  const promptRequest = {
    systemPrompt: "System",
    userPrompt: "Question",
    metadata: {
      expressionMode: "cognitive"
    }
  };

  const finalAnswer = {
    answer: "Réponse cognitive"
  };

  const result =
    await executor.execute({
      promptRequest,
      finalAnswer,
      provider
    });

  assert.strictEqual(
    provider.received,
    promptRequest,
    "Direct execution must preserve the original PromptRequest."
  );

  assert.strictEqual(
    result.content,
    "Réponse directe"
  );

  console.log(
    "PromptRequestExecutor.direct.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
