"use strict";

const assert = require("assert");

const {
  DocumentaryPipeline
} = require(
  "../src/documentary/DocumentaryPipeline"
);

async function run() {
  const pipeline =
    new DocumentaryPipeline();

  const context = {
    question: "Qui est Ali Yata ?",

    userIntent: {
      clarificationRequired: false
    },

    plan: {
      retrievalStrategy: "biography",
      reasoningStrategy: "documentary"
    },

    knowledgePackage: {
      question: "Qui est Ali Yata ?",

      fragments: [
        {
          id: "ali-yata-FRAG-001",
          documentId: "ali-yata",
          sectionTitle: "Naissance",
          text:
            "Ali Yata naît à Tanger.",
          sources: [
            {
              title: "Biographie d’Ali Yata"
            }
          ]
        },
        {
          id: "ali-yata-FRAG-002",
          documentId: "ali-yata",
          sectionTitle: "Parcours politique",
          text:
            "Il rejoint le Parti communiste marocain en 1943.",
          sources: []
        }
      ],

      metadata: {
        strategy: "biography"
      }
    }
  };

  const preparedContext =
    pipeline.prepare(context);

  assert.strictEqual(
    preparedContext,
    context,
    "prepare() must preserve the context."
  );

  const finalAnswer =
    pipeline.complete(context);

  assert.strictEqual(
    typeof finalAnswer,
    "object",
    "complete() must return a FinalAnswer object."
  );

  assert.strictEqual(
    finalAnswer.answer,
    "",
    "DocumentaryPipeline must leave final wording to the expression layer when documentary evidence is available."
  );

  assert.strictEqual(
    finalAnswer.documentaryEvidence.length,
    2,
    "FinalAnswer must expose one documentary evidence item per usable fragment."
  );

  assert.strictEqual(
    finalAnswer.documentaryEvidence[0].text,
    "Ali Yata naît à Tanger.",
    "The first documentary fragment must be preserved."
  );

  assert.strictEqual(
    finalAnswer.documentaryEvidence[1].text,
    "Il rejoint le Parti communiste marocain en 1943.",
    "The second documentary fragment must be preserved."
  );

  assert.strictEqual(
    finalAnswer.confidence,
    "documentary",
    "Confidence must reflect documentary evidence."
  );

  assert.strictEqual(
    finalAnswer.citations.length,
    2,
    "One citation entry must be produced per usable fragment."
  );

  assert.strictEqual(
    finalAnswer.metadata.fragmentsCount,
    2,
    "Metadata must report the number of used fragments."
  );

  assert.strictEqual(
    finalAnswer.metadata.retrievalStrategy,
    "biography",
    "The KnowledgeBase strategy must be preserved."
  );

  console.log(
    "DocumentaryPipeline.test.js: PASS"
  );
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
