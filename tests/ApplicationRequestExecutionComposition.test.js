"use strict";

const assert = require("assert");

const {
  startApplication
} = require("../src/app");

class FakePipeline {
  prepare(context) {
    return context;
  }

  complete(context) {
    return {
      question: context.question || "",
      answer: "FAKE",
      documentaryEvidence: [],
      citations: [],
      metadata: {}
    };
  }

  generateClarification(context) {
    return {
      question: context.question || "",
      answer: "CLARIFICATION",
      documentaryEvidence: [],
      citations: [],
      metadata: {}
    };
  }
}

class FakeContextBuilder {
  build({ question }) {
    return { question };
  }
}

const cognitiveCore = {
  cognitivePipeline: new FakePipeline(),
  cognitiveContextBuilder:
    new FakeContextBuilder()
};

const provider = {
  async invoke() {
    return {
      content: "OK",
      provider: "fake",
      model: "fake-model",
      metadata: {}
    };
  },

  getCapabilities() {
    return {
      streaming: false,
      requestCapacity: {
        maxInputTokens: null,
        maxOutputTokens: null
      },
      rateLimits: {
        maxRequestsPerMinute: null,
        maxTokensPerMinute: null
      }
    };
  }
};

const application =
  startApplication({
    cognitiveCore,
    llmProvider: provider
  });

assert.ok(
  application.llmService.requestExecutor,
  "startApplication must assemble LLMService with a request executor."
);

assert.strictEqual(
  typeof application.llmService
    .requestExecutor.execute,
  "function",
  "The assembled request executor must expose execute()."
);

assert.ok(
  application.requestExecutor.overflowHandler,
  "The main request executor must assemble a documentary overflow handler."
);

assert.strictEqual(
  typeof application.requestExecutor
    .overflowHandler.execute,
  "function",
  "The documentary overflow handler must expose execute()."
);

assert.ok(
  application.requestExecutor
    .overflowHandler.requestExecutor,
  "The documentary overflow handler must use a terminal request executor for final synthesis."
);

assert.notStrictEqual(
  application.requestExecutor
    .overflowHandler.requestExecutor,
  application.requestExecutor,
  "The terminal request executor must be distinct from the main executor."
);

assert.strictEqual(
  application.requestExecutor
    .overflowHandler.requestExecutor
    .overflowHandler,
  null,
  "The terminal request executor must not recursively configure an overflow handler."
);

const injectedMeasurer = {
  measure() {
    return {
      inputTokens: 100,
      characters: 100,
      exact: true,
      measurementMethod: "test-exact-token-count"
    };
  }
};

const injectedApplication =
  startApplication({
    cognitiveCore,
    llmProvider: provider,
    requestExecution: {
      measurer: injectedMeasurer
    }
  });

assert.strictEqual(
  injectedApplication
    .requestExecutor
    .measurer,
  injectedMeasurer,
  "startApplication must allow injection of the request measurer."
);

const mainExecutor =
  application.requestExecutor;

const overflowHandler =
  mainExecutor.overflowHandler;

const terminalExecutor =
  overflowHandler.requestExecutor;

const documentaryExtractor =
  overflowHandler.processor.extractor;

assert.ok(
  mainExecutor.executionPolicy,
  "The main request executor must use an execution policy."
);

assert.ok(
  terminalExecutor.executionPolicy,
  "The terminal request executor must use an execution policy."
);

assert.strictEqual(
  terminalExecutor.executionPolicy,
  mainExecutor.executionPolicy,
  "Main and terminal executors must share the same execution policy."
);

assert.strictEqual(
  documentaryExtractor.requestExecutor,
  terminalExecutor,
  "Documentary extraction must use the terminal request executor."
);

assert.strictEqual(
  documentaryExtractor.requestExecutor
    .overflowHandler,
  null,
  "Documentary extraction must not recursively enter documentary overflow."
);

console.log(
  "✅ Application request execution composition validée"
);

