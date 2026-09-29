"use strict";

const assert = require("assert");

const {
  DocumentaryOverflowHandler
} = require(
  "../src/services/DocumentaryOverflowHandler"
);

class FakePlanner {
  plan(finalAnswer) {
    return {
      mode: "batched",
      batches: [
        {
          index: 0,
          evidence:
            finalAnswer.documentaryEvidence
        }
      ]
    };
  }
}

class FakeProcessor {
  async process({ question, plan }) {
    return {
      question,
      originalEvidence:
        plan.batches[0].evidence,
      facts: [
        {
          text: "Fait consolidé.",
          fragmentIds: ["F1"],
          documentId: "D1",
          sectionTitle: "Section",
          sources: []
        }
      ],
      coveredFragmentIds: ["F1"],
      uncoveredFragmentIds: [],
      completeCoverage: true
    };
  }
}

class FakeConsolidator {
  consolidate(result) {
    return result;
  }
}

class FakeSynthesisPromptBuilder {
  build() {
    return {
      systemPrompt: "Synthesis system",
      userPrompt: "Fait consolidé.",
      metadata: {
        operation:
          "documentary-final-synthesis"
      }
    };
  }
}

class FakeRequestExecutor {
  constructor() {
    this.called = false;
    this.received = null;
  }

  async execute(context) {
    this.called = true;
    this.received = context;

    return {
      provider: "fake",
      content: "FINAL"
    };
  }
}

(async () => {
  const requestExecutor =
    new FakeRequestExecutor();

  const handler =
    new DocumentaryOverflowHandler({
      planner:
        new FakePlanner(),

      processor:
        new FakeProcessor(),

      consolidator:
        new FakeConsolidator(),

      synthesisPromptBuilder:
        new FakeSynthesisPromptBuilder(),

      requestExecutor
    });

  const provider = {
    async invoke() {
      throw new Error(
        "DocumentaryOverflowHandler must not invoke the provider directly when a request executor is configured."
      );
    }
  };

  const finalAnswer = {
    question: "Question",
    documentaryEvidence: [
      {
        fragmentId: "F1",
        text: "Raw evidence"
      }
    ]
  };

  const result =
    await handler.execute({
      promptRequest: {
        systemPrompt: "Original",
        userPrompt: "Oversized",
        metadata: {}
      },
      finalAnswer,
      provider,
      measurement: {
        inputTokens: 1000,
        exact: true
      },
      admission: {
        status: "OVER_CAPACITY"
      }
    });

  assert.strictEqual(
    requestExecutor.called,
    true,
    "Final synthesis must be delegated to the request executor."
  );

  assert.strictEqual(
    requestExecutor.received.provider,
    provider
  );

  assert.strictEqual(
    requestExecutor.received.promptRequest.metadata.operation,
    "documentary-final-synthesis"
  );

  assert.strictEqual(
    result.content,
    "FINAL"
  );

  console.log(
    "DocumentaryOverflowHandler.terminalExecution.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
