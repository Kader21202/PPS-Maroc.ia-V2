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
  question: "Qui est la personne ?",

  originalEvidence: [
    {
      fragmentId: "F1",
      documentId: "D1",
      sectionTitle: "Biographie",
      text: "RAW_SECRET_EVIDENCE_TEXT"
    }
  ],

  facts: [
    {
      text: "La personne a exercé une activité politique.",
      fragmentIds: ["F1"],
      documentId: "D1",
      sectionTitle: "Biographie",
      sources: []
    }
  ],

  coveredFragmentIds: ["F1"],
  uncoveredFragmentIds: [],
  completeCoverage: true
};

const promptRequest =
  builder.build(consolidation);

assert.ok(
  promptRequest &&
  typeof promptRequest === "object"
);

assert.strictEqual(
  typeof promptRequest.systemPrompt,
  "string"
);

assert.strictEqual(
  typeof promptRequest.userPrompt,
  "string"
);

assert.ok(
  promptRequest.userPrompt.includes(
    "La personne a exercé une activité politique."
  ),
  "Final synthesis prompt must contain consolidated facts."
);

assert.ok(
  promptRequest.userPrompt.includes("F1"),
  "Final synthesis prompt must preserve fact-level fragment provenance."
);

assert.strictEqual(
  promptRequest.userPrompt.includes(
    "RAW_SECRET_EVIDENCE_TEXT"
  ),
  false,
  "Final synthesis prompt must not re-inject original raw evidence."
);

assert.strictEqual(
  promptRequest.metadata.operation,
  "documentary-final-synthesis"
);

console.log(
  "DocumentarySynthesisPromptBuilder.contract.test.js: PASS"
);
