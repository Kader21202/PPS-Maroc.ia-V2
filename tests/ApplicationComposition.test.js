"use strict";

const assert = require("assert");

const {
  startApplication
} = require("../src/app");

class FakePipeline {
  prepare(context) {
    context.preparedByFakeCore = true;
  }

  complete(context) {
    return {
      finalAnswer: "FAKE_CORE_OK",
      context
    };
  }

  generateClarification(context) {
    return {
      finalAnswer: "FAKE_CLARIFICATION",
      context
    };
  }
}

class FakeContextBuilder {
  build({ question }) {
    return {
      question
    };
  }
}

const fakeCognitiveCore = {
  cognitivePipeline: new FakePipeline(),
  cognitiveContextBuilder:
    new FakeContextBuilder()
};

const fakeProvider = {
  async invoke() {
    return {
      content: "FAKE_LLM_OK",
      provider: "fake",
      model: "fake-model",
      metadata: {}
    };
  }
};

const application =
  startApplication({
    cognitiveCore: fakeCognitiveCore,
    llmProvider: fakeProvider
  });

assert.strictEqual(
  application.cognitiveCore,
  fakeCognitiveCore
);

assert.strictEqual(
  application.cognitiveAIAdapter
    .cognitivePipeline,
  fakeCognitiveCore.cognitivePipeline
);

assert.strictEqual(
  application.cognitiveAIAdapter
    .cognitiveContextBuilder,
  fakeCognitiveCore.cognitiveContextBuilder
);

assert.throws(
  () => startApplication(),
  /requires a cognitiveCore/
);

assert.throws(
  () => startApplication({
    cognitiveCore: fakeCognitiveCore
  }),
  /requires an llmProvider/
);

console.log(
  "✅ Application composition injection validée"
);


