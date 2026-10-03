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

/*
 * Default composition:
 * request execution exists, but documentary
 * overflow must not be invented without an
 * explicit planning policy.
 */
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

assert.strictEqual(
  application.requestExecutor
    .overflowHandler,
  null,
  "Documentary overflow must remain disabled when no documentary planner is configured."
);

assert.ok(
  application.requestExecutor
    .executionPolicy,
  "The main request executor must use an execution policy."
);

/*
 * Request measurement remains independently
 * injectable.
 */
const injectedMeasurer = {
  measure() {
    return {
      inputTokens: 100,
      characters: 100,
      exact: true,
      measurementMethod:
        "test-exact-token-count"
    };
  }
};

const measurerInjectedApplication =
  startApplication({
    cognitiveCore,
    llmProvider: provider,

    requestExecution: {
      measurer: injectedMeasurer
    }
  });

assert.strictEqual(
  measurerInjectedApplication
    .requestExecutor
    .measurer,
  injectedMeasurer,
  "startApplication must allow injection of the request measurer."
);

assert.strictEqual(
  measurerInjectedApplication
    .requestExecutor
    .overflowHandler,
  null,
  "Injecting a measurer alone must not invent a documentary overflow policy."
);

/*
 * Documentary overflow becomes operational only
 * when a planner is explicitly supplied.
 */
const injectedPlanner = {
  plan(finalAnswer) {
    return {
      mode: "direct",

      batches: [
        {
          evidence:
            finalAnswer.documentaryEvidence || [],
          characters: 0
        }
      ],

      evidenceCount:
        Array.isArray(
          finalAnswer.documentaryEvidence
        )
          ? finalAnswer
              .documentaryEvidence.length
          : 0,

      totalCharacters: 0
    };
  }
};

const plannerInjectedApplication =
  startApplication({
    cognitiveCore,
    llmProvider: provider,

    requestExecution: {
      documentaryPlanner:
        injectedPlanner
    }
  });

const mainExecutor =
  plannerInjectedApplication
    .requestExecutor;

const overflowHandler =
  mainExecutor.overflowHandler;

assert.ok(
  overflowHandler,
  "An explicitly configured documentary planner must enable documentary overflow."
);

assert.strictEqual(
  overflowHandler.planner,
  injectedPlanner,
  "startApplication must preserve the explicitly injected documentary planner."
);

assert.strictEqual(
  typeof overflowHandler.execute,
  "function",
  "The documentary overflow handler must expose execute()."
);

const terminalExecutor =
  overflowHandler.requestExecutor;

assert.ok(
  terminalExecutor,
  "Documentary overflow must use a terminal request executor."
);

assert.notStrictEqual(
  terminalExecutor,
  mainExecutor,
  "The terminal request executor must be distinct from the main executor."
);

assert.strictEqual(
  terminalExecutor.overflowHandler,
  null,
  "The terminal request executor must not recursively configure documentary overflow."
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

const documentaryExtractor =
  overflowHandler.processor.extractor;

assert.strictEqual(
  documentaryExtractor.requestExecutor,
  terminalExecutor,
  "Documentary extraction must use the terminal request executor."
);

assert.strictEqual(
  documentaryExtractor
    .requestExecutor
    .overflowHandler,
  null,
  "Documentary extraction must not recursively enter documentary overflow."
);

console.log(
  "ApplicationRequestExecutionComposition.test.js: PASS"
);
