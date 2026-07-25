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

class FakeRenderer {

  render(finalAnswer) {
    return finalAnswer.answer;
  }

}

class FakeLLM {

  async express(finalAnswer) {
    return {
      provider: "fake",
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

    renderer:
      new FakeRenderer(),

    llm:
      new FakeLLM()

  });

  const response =
    await chat.ask(
      "Quand le PPS a-t-il été créé ?"
    );

  assert.strictEqual(
    response.finalAnswer.answer,
    "Le PPS a été créé le 20 décembre 1974."
  );

  assert.strictEqual(
    response.answer.provider,
    "fake"
  );

  assert.strictEqual(
    response.knowledgePackage.question,
    "Quand le PPS a-t-il été créé ?"
  );

  console.log(
    "✅ ChatService validé"
  );

})();