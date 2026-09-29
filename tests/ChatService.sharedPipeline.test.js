"use strict";

const assert = require("assert");

const {
  ChatService
} = require(
  "../src/services/ChatService"
);

class FakeKnowledgeBase {
  constructor() {
    this.calls = [];
  }

  async build(question, options) {
    this.calls.push({
      question,
      options
    });

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
  constructor() {
    this.prepareCalls = [];
    this.completeCalls = [];
  }

  async prepare({ question }) {
    this.prepareCalls.push(question);

    return {
      cognitiveRequest: {
        question
      },

      userIntent: {
        clarificationRequired: false
      },

      plan: {
        retrievalStrategy: "generic-test"
      }
    };
  }

  async complete(
    context,
    knowledgePackage
  ) {
    this.completeCalls.push({
      context,
      knowledgePackage
    });

    return {
      question:
        context.cognitiveRequest.question,

      answer: "Réponse cognitive",

      confidence: 1
    };
  }
}

class FakeLLM {
  constructor() {
    this.expressCalls = [];
    this.streamCalls = [];
  }

  async express(finalAnswer) {
    this.expressCalls.push(finalAnswer);

    return {
      provider: "fake",
      content: finalAnswer.answer
    };
  }

  async expressStream(
    finalAnswer,
    onChunk
  ) {
    this.streamCalls.push(finalAnswer);

    onChunk(finalAnswer.answer);

    return {
      provider: "fake",
      content: finalAnswer.answer
    };
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

  const normal =
    await chat.ask(
      "Question générique"
    );

  const chunks = [];

  const streamed =
    await chat.askStream(
      "Question générique",
      chunk => chunks.push(chunk)
    );

  assert.strictEqual(
    cognitiveAI.prepareCalls.length,
    2
  );

  assert.strictEqual(
    knowledgeBase.calls.length,
    2
  );

  assert.strictEqual(
    cognitiveAI.completeCalls.length,
    2
  );

  assert.deepStrictEqual(
    knowledgeBase.calls[0],
    knowledgeBase.calls[1],
    "Normal and streaming modes must use the same knowledge request."
  );

  assert.deepStrictEqual(
    normal.finalAnswer,
    streamed.finalAnswer,
    "Normal and streaming modes must produce the same cognitive FinalAnswer."
  );

  assert.strictEqual(
    llm.expressCalls.length,
    1
  );

  assert.strictEqual(
    llm.streamCalls.length,
    1
  );

  assert.deepStrictEqual(
    chunks,
    ["Réponse cognitive"]
  );

  console.log(
    "ChatService.sharedPipeline.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
