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
  async invoke() {
    throw new Error(
      "invoke() must not be called during streaming."
    );
  }

  async stream(promptRequest, onChunk) {

    onChunk("Bonjour ");
    onChunk("camarade");

    return {
      provider: "fake",
      model: "fake-model",
      content: "Bonjour camarade",
      metadata: promptRequest.metadata
    };
  }
}

(async () => {

  const service = new LLMService(
    new FakeProvider(),
    new FakePromptBuilder()
  );

  const received = [];

  const result =
    await service.expressStream(
      {
        answer: "Le PPS a été créé.",
        confidence: 0.95
      },
      chunk => received.push(chunk)
    );

  assert.deepStrictEqual(
    received,
    [
      "Bonjour ",
      "camarade"
    ]
  );

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
    "Bonjour camarade"
  );

  assert.strictEqual(
    result.metadata.confidence,
    0.95
  );

  console.log(
    "✅ LLMService streaming validé"
  );

})().catch(error => {
  console.error(error);
  process.exit(1);
});

