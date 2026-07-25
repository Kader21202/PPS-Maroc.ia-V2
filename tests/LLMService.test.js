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
        confidence: finalAnswer.confidence
      }
    };
  }
}

class FakeProvider {
  async invoke(promptRequest) {
    return {
      provider: "fake",
      model: "fake-model",
      content: "Réponse reformulée",
      metadata: promptRequest.metadata
    };
  }
}

(async () => {

  const service = new LLMService(
    new FakeProvider(),
    new FakePromptBuilder()
  );

  const result = await service.express({
    answer: "Le PPS a été créé en 1974.",
    confidence: 0.95
  });

  assert.strictEqual(
    result.provider,
    "fake"
  );

  assert.strictEqual(
    result.model,
    "fake-model"
  );

  assert.strictEqual(
    result.content,
    "Réponse reformulée"
  );

  assert.strictEqual(
    result.metadata.confidence,
    0.95
  );

  assert.throws(
    () => {
      new LLMService(null);
    },
    /LLMService requires a valid AIProvider/
  );

  console.log("✅ LLMService validé");

})();