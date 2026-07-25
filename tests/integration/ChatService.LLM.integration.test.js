"use strict";

const assert = require("assert");

const {
  ChatService
} = require("../../src/services/ChatService");

const {
  KnowledgeBaseAdapter
} = require("../../src/adapters/KnowledgeBaseAdapter");

const {
  CognitiveAIAdapter
} = require("../../src/adapters/CognitiveAIAdapter");

class FakeKnowledgePackageBuilder {

  build(question, options = {}) {

    return {
      question,
      options,
      fragments: [
        {
          id: "fragment-integration-1",
          content:
            "Le PPS a été créé le 20 décembre 1974."
        }
      ]
    };

  }

}

class FakeContextBuilder {

  build({
    question
  }) {

    return {
      question,
      cognitiveRequest: {
        question
      },
      plan: {
        retrievalStrategy:
          "definition"
      }
    };

  }

}

class FakePipeline {

  prepare(context) {

    context.prepared = true;

  }

  complete(context) {

    return {
      answer:
        "Le PPS a été créé le 20 décembre 1974.",
      confidence: 0.95,
      knowledgePackage:
        context.knowledgePackage
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

    return `LLM : ${finalAnswer.answer}`;

  }

}
const knowledgeBase =
  new KnowledgeBaseAdapter({
    knowledgePackageBuilder:
      new FakeKnowledgePackageBuilder()
  });

const cognitiveAI =
  new CognitiveAIAdapter({
    cognitivePipeline:
      new FakePipeline(),
    cognitiveContextBuilder:
      new FakeContextBuilder()
  });

const chatService =
  new ChatService({
    knowledgeBase,
    cognitiveAI,
    renderer:
      new FakeRenderer(),
    llm:
      new FakeLLM()
  });

  (async () => {

  const response =
    await chatService.ask(
      "Quand le PPS a-t-il été créé ?"
    );

  assert.strictEqual(
  response.answer,
  "LLM : Le PPS a été créé le 20 décembre 1974."
);

  
  assert.strictEqual(
    response.finalAnswer.answer,
    "Le PPS a été créé le 20 décembre 1974."
  );

  assert.strictEqual(
    response.cognitiveContext.prepared,
    true
  );

  assert.ok(
    response.knowledgePackage
  );

  console.log(
    "✅ ChatService integration validée"
  );

})();

