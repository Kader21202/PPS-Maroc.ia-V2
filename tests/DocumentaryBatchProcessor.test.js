"use strict";

const assert = require("assert");

const {
  DocumentaryBatchProcessor
} = require(
  "../src/services/DocumentaryBatchProcessor"
);

class FakeExtractor {
  constructor() {
    this.calls = [];
  }

  async extract({
    question,
    evidence
  }) {
    this.calls.push({
      question,
      evidence
    });

    return {
      question,

      facts: evidence.map(item => ({
        text: `Fact from ${item.fragmentId}`,
        fragmentIds: [item.fragmentId],
        documentId: item.documentId,
        sources: item.sources || []
      })),

      coveredFragmentIds:
        evidence.map(
          item => item.fragmentId
        ),

      uncoveredFragmentIds: [],

      completeCoverage: true,

      metadata: {
        evidenceCount: evidence.length,
        factCount: evidence.length
      }
    };
  }
}

async function run() {
  const evidence = [
    {
      fragmentId: "F1",
      documentId: "DOC-A",
      text: "Evidence one",
      sources: []
    },
    {
      fragmentId: "F2",
      documentId: "DOC-A",
      text: "Evidence two",
      sources: []
    },
    {
      fragmentId: "F3",
      documentId: "DOC-B",
      text: "Evidence three",
      sources: []
    }
  ];

  const plan = {
    mode: "batched",

    evidenceCount: 3,

    batches: [
      {
        evidence: [
          evidence[0],
          evidence[1]
        ],
        characters: 24
      },
      {
        evidence: [
          evidence[2]
        ],
        characters: 14
      }
    ]
  };

  const extractor =
    new FakeExtractor();

  const processor =
    new DocumentaryBatchProcessor({
      extractor
    });

  const result =
    await processor.process({
      question:
        "Question documentaire",
      plan
    });

  assert.strictEqual(
    extractor.calls.length,
    2,
    "Extractor must be called once per documentary batch."
  );

  assert.strictEqual(
    result.batchResults.length,
    2,
    "One extraction result must be preserved per batch."
  );

  assert.deepStrictEqual(
    result.originalEvidence,
    evidence,
    "All original documentary evidence must remain available."
  );

  assert.strictEqual(
    result.facts.length,
    3,
    "Facts from all batches must be collected."
  );

  assert.deepStrictEqual(
    result.facts.map(
      fact => fact.fragmentIds[0]
    ),
    ["F1", "F2", "F3"],
    "Fact provenance must survive batch processing."
  );

  assert.deepStrictEqual(
    result.coveredFragmentIds,
    ["F1", "F2", "F3"],
    "Coverage must be consolidated across batches."
  );

  assert.deepStrictEqual(
    result.uncoveredFragmentIds,
    [],
    "No fragment may be reported uncovered when every batch covers its evidence."
  );

  assert.strictEqual(
    result.completeCoverage,
    true,
    "Combined batch processing must report complete coverage."
  );

  console.log(
    "DocumentaryBatchProcessor.test.js: PASS"
  );
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
