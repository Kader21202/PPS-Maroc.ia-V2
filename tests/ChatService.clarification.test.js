"use strict";

const assert = require("assert");

const {
  ChatService
} = require("../src/services/ChatService");

class FakeKnowledgeBase {
  constructor() {
    this.buildCalled = false;
  }

  async build() {
    this.buildCalled = true;

    throw new Error(
      "KnowledgeBase.build must not be called."
    );
  }
}

class FakeCognitiveAI {
  constructor() {
    this.generateClarificationCalled = false;
    this.completeCalled = false;
  }

  async prepare({ question }) {
    return {
      question,
      userIntent: {
        intentType: "unknown",
        clarificationRequired: true,
        contextDependency: false
      },
      plan: null
    };
  }

  generateClarification(context) {
    this.generateClarificationCalled = true;

    return {
      answer:
        "Pouvez-vous préciser votre demande ?",
      summary:
        "Une clarification est nécessaire.",
      citations: [],
      confidence: 1,
      reasoningSummary: null,
      followUpQuestions: [],
      metadata: {
        responseType: "clarification",
        clarificationReason: "unknown_intent"
      },
      context
    };
  }

  async complete() {
    this.completeCalled = true;

    throw new Error(
      "CognitiveAI.complete must not be called."
    );
  }
}

class FakeLLM {
  constructor() {
    this.expressCalled = false;
  }

  async express() {
    this.expressCalled = true;

    throw new Error(
      "LLM.express must not be called."
    );
  }
}

(async () => {
  const knowledgeBase =
    new FakeKnowledgeBase();

  const cognitiveAI =
    new FakeCognitiveAI();

  const llm =
    new FakeLLM();

  const chat =
    new ChatService({
      knowledgeBase,
      cognitiveAI,
      llm
    });

  const response =
    await chat.ask("Explique-moi ça");

  assert.strictEqual(
    response.finalAnswer.answer,
    "Pouvez-vous préciser votre demande ?"
  );

  assert.strictEqual(
    response.answer,
    "Pouvez-vous préciser votre demande ?"
  );

  assert.strictEqual(
    response.knowledgePackage,
    null
  );

  assert.strictEqual(
    response.cognitiveContext.userIntent
      .clarificationRequired,
    true
  );

  assert.strictEqual(
    cognitiveAI.generateClarificationCalled,
    true
  );

  assert.strictEqual(
    knowledgeBase.buildCalled,
    false
  );

  assert.strictEqual(
    cognitiveAI.completeCalled,
    false
  );

  assert.strictEqual(
    llm.expressCalled,
    false
  );

  console.log(
    "✅ ChatService clarification validé"
  );
})();
