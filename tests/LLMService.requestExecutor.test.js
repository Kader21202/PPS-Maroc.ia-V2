"use strict";

const assert = require("assert");

const {
  LLMService
} = require("../src/services/LLMService");

class FakePromptBuilder {
  build(finalAnswer) {
    return {
      systemPrompt: "System prompt",
      userPrompt: finalAnswer.answer,
      metadata: {
        expressionMode: "documentary"
      }
    };
  }
}

class FakeProvider {
  async invoke() {
    throw new Error(
      "Provider must not be invoked directly when a request executor is configured."
    );
  }
}

class FakeRequestExecutor {
  constructor() {
    this.received = null;
  }

  async execute({
    promptRequest,
    finalAnswer,
    provider
  }) {
    this.received = {
      promptRequest,
      finalAnswer,
      provider
    };

    return {
      provider: "fake-executor",
      model: "fake-model",
      content: "Réponse exécutée",
      metadata: promptRequest.metadata
    };
  }
}

(async () => {
  const provider =
    new FakeProvider();

  const executor =
    new FakeRequestExecutor();

  const service =
    new LLMService(
      provider,
      new FakePromptBuilder(),
      executor
    );

  const finalAnswer = {
    answer: "",
    documentaryEvidence: [
      {
        fragmentId: "F1",
        text: "Preuve documentaire"
      }
    ]
  };

  const result =
    await service.express(finalAnswer);

  assert.strictEqual(
    executor.received.finalAnswer,
    finalAnswer,
    "Executor must receive the original FinalAnswer."
  );

  assert.strictEqual(
    executor.received.provider,
    provider,
    "Executor must receive the configured provider."
  );

  assert.strictEqual(
    executor.received.promptRequest.userPrompt,
    ""
  );

  assert.strictEqual(
    result.content,
    "Réponse exécutée"
  );

  console.log(
    "LLMService.requestExecutor.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
