"use strict";

const assert = require("assert");

const {
  DocumentaryEvidenceExtractor
} = require(
  "../src/services/DocumentaryEvidenceExtractor"
);

class FakeProvider {
  async invoke(promptRequest) {
    assert.ok(
      promptRequest.userPrompt.includes("F1"),
      "Extraction prompt must expose fragment identifiers."
    );

    assert.ok(
      promptRequest.userPrompt.includes("F2"),
      "Extraction prompt must expose all fragment identifiers."
    );

    return {
      provider: "fake",
      model: "fake-model",
      content: JSON.stringify({
        facts: [
          {
            text: "Ali Yata est né à Tanger.",
            fragmentIds: ["F1"]
          },
          {
            text:
              "Ali Yata rejoint le Parti communiste marocain en 1943.",
            fragmentIds: ["F2"]
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
      documentId: "ali-yata",
      sectionTitle: "Naissance",
      text: "Ali Yata est né à Tanger.",
      sources: [
        {
          title: "Biographie d'Ali Yata"
        }
      ]
    },
    {
      fragmentId: "F2",
      documentId: "ali-yata",
      sectionTitle: "Parcours",
      text:
        "Ali Yata rejoint le Parti communiste marocain en 1943.",
      sources: []
    }
  ];

  const extractor =
    new DocumentaryEvidenceExtractor({
      provider: new FakeProvider()
    });

  const result =
    await extractor.extract({
      question: "Qui est Ali Yata ?",
      evidence
    });

  assert.ok(
    Array.isArray(result.facts),
    "Extractor must return facts."
  );

  assert.strictEqual(
    result.facts.length,
    2,
    "Both supported facts must be preserved."
  );

  assert.deepStrictEqual(
    result.facts[0].fragmentIds,
    ["F1"],
    "Fact provenance must be preserved."
  );

  assert.strictEqual(
    result.facts[0].documentId,
    "ali-yata",
    "Document provenance must be restored from evidence."
  );

  assert.deepStrictEqual(
    result.facts[0].sources,
    [
      {
        title: "Biographie d'Ali Yata"
      }
    ],
    "Original sources must be preserved."
  );

  assert.deepStrictEqual(
    result.facts[1].fragmentIds,
    ["F2"],
    "Second fact provenance must be preserved."
  );

  console.log(
    "DocumentaryEvidenceExtractor.test.js: PASS"
  );
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
