"use strict";

const assert = require("assert");

const {
  DocumentaryContextPlanner
} = require(
  "../src/services/DocumentaryContextPlanner"
);

const evidence = [
  {
    fragmentId: "F1",
    documentId: "DOC",
    sectionTitle: "Section 1",
    text:
      "Ali Yata est né à Tanger. Il rejoint ensuite le PCM.",
    sources: []
  },
  {
    fragmentId: "F2",
    documentId: "DOC",
    sectionTitle: "Section 2",
    text:
      "Il participe au mouvement national et connaît plusieurs périodes d'emprisonnement.",
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

const recovered =
  plan.batches.flatMap(
    batch => batch.evidence
  );

assert.strictEqual(
  recovered.length,
  evidence.length,
  "All original evidence must remain recoverable."
);

assert.strictEqual(
  recovered[0],
  evidence[0],
  "Planner must preserve the original evidence object."
);

assert.strictEqual(
  recovered[1],
  evidence[1],
  "Planner must preserve the original evidence object."
);

assert.strictEqual(
  recovered[0].text,
  evidence[0].text,
  "Original documentary text must remain unchanged."
);

assert.strictEqual(
  recovered[1].text,
  evidence[1].text,
  "Original documentary text must remain unchanged."
);

console.log(
  "DocumentaryContextPlanner.originalEvidence.test.js: PASS"
);
