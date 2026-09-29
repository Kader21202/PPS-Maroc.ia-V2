"use strict";

const assert = require("assert");

const {
  DocumentaryOverflowHandler
} = require(
  "../src/services/DocumentaryOverflowHandler"
);

class FakePlanner {
  constructor() {
    this.received = null;
  }

  plan(finalAnswer) {
    this.received = finalAnswer;

    return {
      mode: "batched",
      batches: [
        {
          index: 0,
          evidence: [
            {
              fragmentId: "F1",
              text: "Evidence 1"
            }
          ]
        }
      ]
    };
  }
}

class FakeProcessor {
  constructor() {
    this.received = null;
  }

  async process(input) {
    this.received = input;

    return {
      question: input.question,
      originalEvidence:
        input.plan.batches[0].evidence,
      facts: [
        {
          text: "Fact 1",
          fragmentIds: ["F1"]
        }
      ],
      coveredFragmentIds: ["F1"],
      uncoveredFragmentIds: [],
      completeCoverage: true
    };
  }
}

class FakeConsolidator {
  constructor() {
    this.received = null;
  }

  consolidate(processorResult) {
    this.received = processorResult;

    return {
      question: processorResult.question,
      originalEvidence:
        processorResult.originalEvidence,
      facts: processorResult.facts,
      coveredFragmentIds: ["F1"],
      uncoveredFragmentIds: [],
      completeCoverage: true
    };
  }
}

(async () => {
  const planner =
    new FakePlanner();

  const processor =
    new FakeProcessor();

  const consolidator =
    new FakeConsolidator();

  const handler =
    new DocumentaryOverflowHandler({
      planner,
      processor,
      consolidator
    });

  const finalAnswer = {
    question: "Question documentaire",
    documentaryEvidence: [
      {
        fragmentId: "F1",
        text: "Evidence 1"
      }
    ]
  };

  const result =
    await handler.execute({
      promptRequest: {
        systemPrompt: "System",
        userPrompt: "Oversized prompt",
        metadata: {}
      },
      finalAnswer,
      provider: {
        invoke() {
          throw new Error(
            "Provider must not be invoked by the orchestration-only handler."
          );
        }
      },
      measurement: {
        inputTokens: 150,
        exact: true
      },
      admission: {
        status: "OVER_CAPACITY"
      }
    });

  assert.strictEqual(
    planner.received,
    finalAnswer,
    "Handler must plan from the original FinalAnswer."
  );

  assert.strictEqual(
    processor.received.question,
    finalAnswer.question,
    "Handler must preserve the original question."
  );

  assert.ok(
    processor.received.plan,
    "Handler must pass the documentary plan to the processor."
  );

  assert.strictEqual(
    consolidator.received.facts[0].text,
    "Fact 1",
    "Handler must consolidate the processor result."
  );

  assert.strictEqual(
    result.facts[0].text,
    "Fact 1"
  );

  assert.deepStrictEqual(
    result.originalEvidence[0],
    finalAnswer.documentaryEvidence[0],
    "Original evidence provenance data must remain preserved."
  );

  console.log(
    "DocumentaryOverflowHandler.orchestration.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
