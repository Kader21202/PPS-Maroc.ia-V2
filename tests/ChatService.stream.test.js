"use strict";

const assert = require("assert");

const {
  ChatService
} = require("../src/services/ChatService");

class FakeKnowledgeBase {
  async build(question) {
    return {
      question,
      fragments: [],
      evidence: [],
      sources: [],
      metadata: {}
    };
  }
}

class FakeCognitiveAI {
  async prepare({ question }) {
    return {
      cognitiveRequest: {
        question
      },
      plan: {
        retrievalStrategy: "definition"
      }
    };
  }

  async complete() {
    return {
      answer: "Le PPS a été créé le 20 décembre 1974.",
      confidence: 0.95
    };
  }
}

class FakeLLM {
  async express() {
    throw new Error(
      "express() must not be called during streaming."
    );
  }

  async expressStream(finalAnswer, onChunk) {
    onChunk("Le PPS a été créé ");
    onChunk("le 20 décembre 1974.");

    return {
      provider: "fake",
      model: "fake-model",
      content: finalAnswer.answer
    };
  }
}

(async () => {
  const chat = new ChatService({
    knowledgeBase:
      new FakeKnowledgeBase(),

    cognitiveAI:
      new FakeCognitiveAI(),

    llm:
      new FakeLLM()
  });

  const received = [];

  const response =
    await chat.askStream(
      "Quand le PPS a-t-il été créé ?",
      chunk => received.push(chunk)
    );

  assert.deepStrictEqual(
    received,
    [
      "Le PPS a été créé ",
      "le 20 décembre 1974."
    ]
  );

  assert.strictEqual(
    response.answer.provider,
    "fake"
  );

  assert.strictEqual(
    response.answer.content,
    "Le PPS a été créé le 20 décembre 1974."
  );

  assert.strictEqual(
    response.finalAnswer.answer,
    "Le PPS a été créé le 20 décembre 1974."
  );

  assert.strictEqual(
    response.knowledgePackage.question,
    "Quand le PPS a-t-il été créé ?"
  );

  assert.strictEqual(
    response.cognitiveContext
      .plan.retrievalStrategy,
    "definition"
  );

  console.log(
    "✅ ChatService streaming validé"
  );

})().catch(error => {
  console.error(error);
  process.exit(1);
});
