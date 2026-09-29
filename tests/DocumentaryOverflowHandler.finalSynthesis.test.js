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
    return {
      ...result,
      metadata: {
        operation:
          "documentary-consolidation"
      }
    };
  }
}

class FakeSynthesisPromptBuilder {
  constructor() {
    this.received = null;
  }

  build(consolidation) {
    this.received = consolidation;

    return {
      systemPrompt:
        "Synthesis system",

      userPrompt:
        "FACT: Fait consolidé.\nFRAGMENT_ID: F1",

      metadata: {
        operation:
          "documentary-final-synthesis"
      }
    };
  }
}

class FakeProvider {
  constructor() {
    this.received = null;
  }

  async invoke(promptRequest) {
    this.received = promptRequest;

    return {
      provider: "fake",
      content: "Réponse finale synthétisée."
    };
  }
}

(async () => {
  const synthesisPromptBuilder =
    new FakeSynthesisPromptBuilder();

  const handler =
    new DocumentaryOverflowHandler({
      planner:
        new FakePlanner(),

      processor:
        new FakeProcessor(),

      consolidator:
        new FakeConsolidator(),

      synthesisPromptBuilder
    });

  const provider =
    new FakeProvider();

  const finalAnswer = {
    question:
      "Question documentaire",

    documentaryEvidence: [
      {
        fragmentId: "F1",
        documentId: "D1",
        sectionTitle: "Section",
        text: "RAW_EVIDENCE"
      }
    ]
  };

  const result =
    await handler.execute({
      promptRequest: {
        systemPrompt: "Original",
        userPrompt: "Oversized raw prompt",
        metadata: {}
      },

      finalAnswer,
      provider,

      measurement: {
        inputTokens: 150,
        exact: true
      },

      admission: {
        status: "OVER_CAPACITY"
      }
    });

  assert.ok(
    synthesisPromptBuilder.received,
    "Handler must build the final prompt from the consolidation."
  );

  assert.strictEqual(
    synthesisPromptBuilder.received.facts[0].text,
    "Fait consolidé."
  );

  assert.ok(
    provider.received,
    "Handler must invoke the provider with the synthesis PromptRequest."
  );

  assert.strictEqual(
    provider.received.metadata.operation,
    "documentary-final-synthesis"
  );

  assert.strictEqual(
    provider.received.userPrompt.includes(
      "RAW_EVIDENCE"
    ),
    false,
    "Final provider invocation must not contain raw documentary evidence."
  );

  assert.strictEqual(
    result.content,
    "Réponse finale synthétisée."
  );

  console.log(
    "DocumentaryOverflowHandler.finalSynthesis.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
