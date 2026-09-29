"use strict";

const assert = require("assert");

const {
  DocumentaryConsolidator
} = require(
  "../src/services/DocumentaryConsolidator"
);

const processorResult = {
  question: "Qui est Ali Yata ?",

  originalEvidence: [
    {
      fragmentId: "F1",
      documentId: "ali-yata",
      text: "Texte original F1",
      sources: []
    },
    {
      fragmentId: "F2",
      documentId: "ali-yata",
      text: "Texte original F2",
      sources: []
    }
  ],

  facts: [
    {
      text: "Ali Yata est né à Tanger.",
      fragmentIds: ["F1"],
      documentId: "ali-yata",
      sources: []
    },
    {
      text:
        "Ali Yata rejoint le Parti communiste marocain en 1943.",
      fragmentIds: ["F2"],
      documentId: "ali-yata",
      sources: []
    }
  ],

  coveredFragmentIds: ["F1", "F2"],
  uncoveredFragmentIds: [],
  completeCoverage: true
};

const consolidator =
  new DocumentaryConsolidator();

const result =
  consolidator.consolidate(
    processorResult
  );

assert.strictEqual(
  result.question,
  "Qui est Ali Yata ?"
);

assert.deepStrictEqual(
  result.facts,
  processorResult.facts,
  "Consolidation must preserve extracted facts exactly."
);

assert.strictEqual(
  result.facts[0],
  processorResult.facts[0],
  "Consolidator must not rewrite fact objects."
);

assert.strictEqual(
  result.facts[1],
  processorResult.facts[1],
  "Consolidator must not rewrite fact objects."
);

assert.deepStrictEqual(
  result.originalEvidence,
  processorResult.originalEvidence,
  "Original documentary evidence must survive consolidation."
);

assert.strictEqual(
  result.originalEvidence[0],
  processorResult.originalEvidence[0],
  "Original evidence objects must remain intact."
);

assert.deepStrictEqual(
  result.coveredFragmentIds,
  ["F1", "F2"]
);

assert.deepStrictEqual(
  result.uncoveredFragmentIds,
  []
);

assert.strictEqual(
  result.completeCoverage,
  true
);

assert.strictEqual(
  result.metadata.factCount,
  2
);

assert.strictEqual(
  result.metadata.evidenceCount,
  2
);

console.log(
  "DocumentaryConsolidator.test.js: PASS"
);
