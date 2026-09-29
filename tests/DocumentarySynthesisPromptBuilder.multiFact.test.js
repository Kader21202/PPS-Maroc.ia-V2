"use strict";

const assert = require("assert");

const {
  DocumentarySynthesisPromptBuilder
} = require(
  "../src/prompts/DocumentarySynthesisPromptBuilder"
);

const builder =
  new DocumentarySynthesisPromptBuilder();

const consolidation = {
  question: "Question documentaire",

  originalEvidence: [
    {
      fragmentId: "F1",
      text: "RAW_EVIDENCE_ONE"
    },
    {
      fragmentId: "F2",
      text: "RAW_EVIDENCE_TWO"
    },
    {
      fragmentId: "F3",
      text: "RAW_EVIDENCE_THREE"
    }
  ],

  facts: [
    {
      text: "Premier fait consolidé.",
      fragmentIds: ["F1"],
      documentId: "D1",
      sectionTitle: "Section A",
      sources: []
    },
    {
      text: "Deuxième fait consolidé.",
      fragmentIds: ["F2", "F3"],
      documentId: "D2",
      sectionTitle: "Section B",
      sources: []
    },
    {
      text: "Troisième fait consolidé.",
      fragmentIds: ["F3"],
      documentId: "D2",
      sectionTitle: "Section C",
      sources: []
    }
  ],

  coveredFragmentIds: [
    "F1",
    "F2",
    "F3"
  ],

  uncoveredFragmentIds: [],

  completeCoverage: true
};

const promptRequest =
  builder.build(consolidation);

for (const fact of consolidation.facts) {
  assert.ok(
    promptRequest.userPrompt.includes(
      fact.text
    ),
    `Final synthesis prompt lost fact: ${fact.text}`
  );

  for (
    const fragmentId
    of fact.fragmentIds
  ) {
    assert.ok(
      promptRequest.userPrompt.includes(
        fragmentId
      ),
      `Final synthesis prompt lost provenance: ${fragmentId}`
    );
  }
}

for (
  const evidence
  of consolidation.originalEvidence
) {
  assert.strictEqual(
    promptRequest.userPrompt.includes(
      evidence.text
    ),
    false,
    `Raw evidence must not be re-injected: ${evidence.fragmentId}`
  );
}

assert.strictEqual(
  promptRequest.metadata.factCount,
  3
);

assert.strictEqual(
  promptRequest.metadata.evidenceCount,
  3
);

assert.strictEqual(
  promptRequest.metadata.completeCoverage,
  true
);

console.log(
  "DocumentarySynthesisPromptBuilder.multiFact.test.js: PASS"
);
