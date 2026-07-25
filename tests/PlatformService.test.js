"use strict";

const assert = require("assert");

const {
  PlatformService
} = require("../src/services/PlatformService");

class FakeGuardrails {

  constructor() {
    this.inputValidated = false;
    this.outputValidated = false;
  }

  validateInput(question) {
    assert.strictEqual(
      question,
      "Quand le PPS a-t-il été créé ?"
    );

    this.inputValidated = true;
  }

  validateOutput(finalAnswer) {
    assert.deepStrictEqual(
      finalAnswer,
      {
        answer:
          "Le PPS a été créé le 20 décembre 1974.",
        confidence: 0.95
      }
    );

    this.outputValidated = true;
  }

}

class FakeChatService {

  async ask(question) {
    return {
      question,
      answer: {
        provider: "fake",
        content:
          "Le PPS a été créé le 20 décembre 1974."
      },
      finalAnswer: {
        answer:
          "Le PPS a été créé le 20 décembre 1974.",
        confidence: 0.95
      },
      verificationReport: null,
      knowledgePackage: {
        question
      },
      cognitiveContext: {}
    };
  }

}

(async () => {

  const guardrails =
    new FakeGuardrails();

  const platform =
    new PlatformService({
      guardrails,
      chatService:
        new FakeChatService()
    });

  const response =
    await platform.ask(
      "Quand le PPS a-t-il été créé ?"
    );

  assert.strictEqual(
    guardrails.inputValidated,
    true
  );

  assert.strictEqual(
    guardrails.outputValidated,
    true
  );

  assert.strictEqual(
    response.finalAnswer.confidence,
    0.95
  );

  console.log(
    "✅ PlatformService validé"
  );

})();