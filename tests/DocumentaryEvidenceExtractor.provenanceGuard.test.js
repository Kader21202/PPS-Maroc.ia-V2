"use strict";

const assert = require("assert");

const {
  DocumentaryEvidenceExtractor
} = require(
  "../src/services/DocumentaryEvidenceExtractor"
);

class InvalidProvenanceProvider {
  async invoke() {
    return {
      provider: "fake",
      model: "fake-model",
      content: JSON.stringify({
        facts: [
          {
            text: "Information prétendument documentaire.",
            fragmentIds: ["INVENTED-FRAGMENT"]
          }
        ]
      }),
      metadata: {}
    };
  }
}

async function run() {
  const extractor =
    new DocumentaryEvidenceExtractor({
      provider:
        new InvalidProvenanceProvider()
    });

  let rejected = false;

  try {
    await extractor.extract({
      question: "Question test",
      evidence: [
        {
          fragmentId: "F1",
          documentId: "DOC",
          sectionTitle: "Section",
          text:
            "Information réellement présente.",
          sources: []
        }
      ]
    });
  } catch (error) {
    rejected = true;

    assert.match(
      error.message,
      /unknown fragmentId: INVENTED-FRAGMENT/
    );
  }

  assert.strictEqual(
    rejected,
    true,
    "Extractor must reject invented documentary provenance."
  );

  console.log(
    "DocumentaryEvidenceExtractor.provenanceGuard.test.js: PASS"
  );
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
