"use strict";

const assert = require("assert");

const {
  DocumentaryEvidenceExtractor
} = require(
  "../src/services/DocumentaryEvidenceExtractor"
);

class PartialFakeProvider {
  async invoke() {
    return {
      provider: "fake",
      model: "fake-model",
      content: JSON.stringify({
        facts: [
          {
            text: "Fait provenant uniquement de F1.",
            fragmentIds: ["F1"]
          }
        ]
      }),
      metadata: {}
    };
  }
}

async function run() {
  const evidence = [
    {
      fragmentId: "F1",
      documentId: "DOC",
      sectionTitle: "Section 1",
      text: "Information importante numéro un.",
      sources: []
    },
    {
      fragmentId: "F2",
      documentId: "DOC",
      sectionTitle: "Section 2",
      text: "Information importante numéro deux.",
      sources: []
    },
    {
      fragmentId: "F3",
      documentId: "DOC",
      sectionTitle: "Section 3",
      text: "Information importante numéro trois.",
      sources: []
    }
  ];

  const extractor =
    new DocumentaryEvidenceExtractor({
      provider: new PartialFakeProvider()
    });

  const result =
    await extractor.extract({
      question: "Question documentaire",
      evidence
    });

  assert.deepStrictEqual(
    result.coveredFragmentIds,
    ["F1"],
    "Extractor must report fragments represented by extracted facts."
  );

  assert.deepStrictEqual(
    result.uncoveredFragmentIds,
    ["F2", "F3"],
    "Extractor must explicitly report documentary evidence not represented in extracted facts."
  );

  assert.strictEqual(
    result.completeCoverage,
    false,
    "Extraction must not claim complete coverage when fragments are uncovered."
  );

  assert.strictEqual(
    result.metadata.coveredEvidenceCount,
    1
  );

  assert.strictEqual(
    result.metadata.uncoveredEvidenceCount,
    2
  );

  console.log(
    "DocumentaryEvidenceExtractor.coverage.test.js: PASS"
  );
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
