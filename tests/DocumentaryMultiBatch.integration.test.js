"use strict";

const assert = require("assert");

const {
  DocumentaryContextPlanner
} = require(
  "../src/services/DocumentaryContextPlanner"
);

const {
  DocumentaryEvidenceExtractor
} = require(
  "../src/services/DocumentaryEvidenceExtractor"
);

const {
  DocumentaryBatchProcessor
} = require(
  "../src/services/DocumentaryBatchProcessor"
);

const {
  DocumentaryConsolidator
} = require(
  "../src/services/DocumentaryConsolidator"
);

class FakeProvider {
  constructor() {
    this.calls = [];
  }

  async invoke(promptRequest) {
    this.calls.push(promptRequest);

    const ids =
      [
        ...promptRequest.userPrompt.matchAll(
          /FRAGMENT_ID:\s*(\S+)/g
        )
      ].map(match => match[1]);

    return {
      provider: "fake",
      model: "fake-model",

      content: JSON.stringify({
        facts: ids.map(id => ({
          text: `Fact extracted from ${id}`,
          fragmentIds: [id]
        }))
      }),

      metadata: {}
    };
  }
}

async function run() {
  const evidence = [
    {
      fragmentId: "F1",
      documentId: "DOC-A",
      sectionTitle: "A1",
      text: "A".repeat(60),
      sources: [{ title: "Source A" }]
    },
    {
      fragmentId: "F2",
      documentId: "DOC-A",
      sectionTitle: "A2",
      text: "B".repeat(60),
      sources: []
    },
    {
      fragmentId: "F3",
      documentId: "DOC-B",
      sectionTitle: "B1",
      text: "C".repeat(60),
      sources: [{ title: "Source B" }]
    },
    {
      fragmentId: "F4",
      documentId: "DOC-B",
      sectionTitle: "B2",
      text: "D".repeat(20),
      sources: []
    }
  ];

  const planner =
    new DocumentaryContextPlanner({
      maxCharactersPerBatch: 100
    });

  const plan =
    planner.plan({
      documentaryEvidence: evidence
    });

  assert.strictEqual(
    plan.mode,
    "batched"
  );

  assert.ok(
    plan.batches.length > 1
  );

  const provider =
    new FakeProvider();

  const extractor =
    new DocumentaryEvidenceExtractor({
      provider
    });

  const processor =
    new DocumentaryBatchProcessor({
      extractor
    });

  const processed =
    await processor.process({
      question: "Question documentaire",
      plan
    });

  const consolidator =
    new DocumentaryConsolidator();

  const consolidated =
    consolidator.consolidate(
      processed
    );

  assert.strictEqual(
    provider.calls.length,
    plan.batches.length,
    "Provider must be called once per batch."
  );

  assert.strictEqual(
    consolidated.originalEvidence.length,
    4,
    "All original evidence must survive the complete pipeline."
  );

  assert.deepStrictEqual(
    consolidated.originalEvidence,
    evidence,
    "Original evidence must remain unchanged."
  );

  assert.strictEqual(
    consolidated.facts.length,
    4,
    "Facts from every batch must reach consolidation."
  );

  assert.deepStrictEqual(
    consolidated.facts.map(
      fact => fact.fragmentIds[0]
    ),
    ["F1", "F2", "F3", "F4"],
    "Provenance order must survive the complete pipeline."
  );

  assert.deepStrictEqual(
    consolidated.coveredFragmentIds,
    ["F1", "F2", "F3", "F4"]
  );

  assert.deepStrictEqual(
    consolidated.uncoveredFragmentIds,
    []
  );

  assert.strictEqual(
    consolidated.completeCoverage,
    true
  );

  console.log(
    "DocumentaryMultiBatch.integration.test.js: PASS"
  );
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
