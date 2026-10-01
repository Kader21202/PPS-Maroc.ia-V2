"use strict";

const assert = require("assert");

const {
  DocumentaryEvidenceExtractor
} = require(
  "../src/services/DocumentaryEvidenceExtractor"
);

(async () => {
  let executorCalls = 0;
  let directProviderCalls = 0;

  const provider = {
    async invoke() {
      directProviderCalls += 1;

      throw new Error(
        "Provider must not be invoked directly when a request executor is supplied."
      );
    }
  };

  const requestExecutor = {
    async execute({
      promptRequest,
      finalAnswer,
      provider: receivedProvider
    }) {
      executorCalls += 1;

      assert.strictEqual(
        receivedProvider,
        provider,
        "Extractor must forward its provider to the request executor."
      );

      assert.strictEqual(
        promptRequest.metadata.operation,
        "documentary-evidence-extraction"
      );

      assert.strictEqual(
        finalAnswer.question,
        "Question documentaire"
      );

      return {
        provider: "test-provider",
        content: JSON.stringify({
          facts: [
            {
              text: "Fait extrait.",
              fragmentIds: ["F1"]
            }
          ]
        })
      };
    }
  };

  const extractor =
    new DocumentaryEvidenceExtractor({
      provider,
      requestExecutor
    });

  const result =
    await extractor.extract({
      question:
        "Question documentaire",

      evidence: [
        {
          fragmentId: "F1",
          documentId: "D1",
          sectionTitle: "Section 1",
          text: "Texte documentaire.",
          sources: ["source-1"]
        }
      ]
    });

  assert.strictEqual(
    executorCalls,
    1,
    "Documentary extraction must pass through the request executor."
  );

  assert.strictEqual(
    directProviderCalls,
    0,
    "Documentary extraction must not bypass the request executor."
  );

  assert.strictEqual(
    result.facts.length,
    1
  );

  assert.strictEqual(
    result.facts[0].text,
    "Fait extrait."
  );

  assert.deepStrictEqual(
    result.facts[0].fragmentIds,
    ["F1"]
  );

  console.log(
    "DocumentaryEvidenceExtractor.requestExecutor.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
