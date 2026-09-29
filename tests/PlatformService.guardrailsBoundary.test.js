"use strict";

const assert = require("assert");

const {
  ChatService
} = require(
  "../src/services/ChatService"
);

const {
  PlatformService
} = require(
  "../src/services/PlatformService"
);

class CountingGuardrails {
  constructor() {
    this.inputCount = 0;
    this.outputCount = 0;
  }

  validateInput() {
    this.inputCount += 1;
  }

  validateOutput() {
    this.outputCount += 1;
  }
}

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

      userIntent: {
        clarificationRequired: false
      },

      plan: {
        retrievalStrategy: "definition"
      }
    };
  }

  async complete() {
    return {
      answer: "Réponse cognitive",
      confidence: 1
    };
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
  const guardrails =
    new CountingGuardrails();

  const chatService =
    new ChatService({
      knowledgeBase:
        new FakeKnowledgeBase(),

      cognitiveAI:
        new FakeCognitiveAI(),

      llm:
        new FakeLLM(),

      guardrails
    });

  const platform =
    new PlatformService({
      guardrails,
      chatService
    });

  await platform.ask(
    "Question générique"
  );

  assert.strictEqual(
    guardrails.inputCount,
    1,
    "Input guardrails must run exactly once at the platform boundary."
  );

  assert.strictEqual(
    guardrails.outputCount,
    1,
    "Output guardrails must run exactly once at the platform boundary."
  );

  console.log(
    "PlatformService.guardrailsBoundary.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
