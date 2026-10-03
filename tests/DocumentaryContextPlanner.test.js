"use strict";

const assert = require("assert");

const {
  DocumentaryContextPlanner
} = require(
  "../src/services/DocumentaryContextPlanner"
);

const planner =
  new DocumentaryContextPlanner({
    maxCharactersPerBatch: 100
  });

const evidence = [
  {
    fragmentId: "F1",
    text: "A".repeat(60)
  },
  {
    fragmentId: "F2",
    text: "B".repeat(60)
  },
  {
    fragmentId: "F3",
    text: "C".repeat(20)
  }
];

const plan = planner.plan({
  documentaryEvidence: evidence
});

assert.strictEqual(
  plan.mode,
  "batched",
  "Oversized documentary evidence must be partitioned."
);

assert.ok(
  Array.isArray(plan.batches),
  "Planner must return batches."
);

assert.ok(
  plan.batches.length > 1,
  "Evidence must require more than one batch."
);

const plannedEvidence =
  plan.batches.flatMap(
    batch => batch.evidence
  );

assert.strictEqual(
  plannedEvidence.length,
  evidence.length,
  "No documentary evidence may be lost."
);

assert.deepStrictEqual(
  plannedEvidence.map(item => item.fragmentId),
  ["F1", "F2", "F3"],
  "Documentary order must be preserved."
);

for (const batch of plan.batches) {
  const size =
    batch.evidence.reduce(
      (total, item) =>
        total + item.text.length,
      0
    );

  assert.ok(
    size <= 100,
    "Each batch must respect the configured budget."
  );
}

console.log(
  "DocumentaryContextPlanner.test.js: PASS"
);

const directPlanner =
  new DocumentaryContextPlanner({
    maxCharactersPerBatch: 1000
  });

const directEvidence = [
  {
    fragmentId: "D1",
    documentId: "DOC-1",
    sectionTitle: "Section A",
    text: "Information documentaire A",
    sources: [{ title: "Source A" }]
  },
  {
    fragmentId: "D2",
    documentId: "DOC-2",
    sectionTitle: "Section B",
    text: "Information documentaire B",
    sources: [{ title: "Source B" }]
  }
];

const directPlan =
  directPlanner.plan({
    documentaryEvidence: directEvidence
  });

assert.strictEqual(
  directPlan.mode,
  "direct",
  "Evidence fitting the budget must remain direct."
);

assert.strictEqual(
  directPlan.batches.length,
  1,
  "Direct evidence must produce exactly one batch."
);

assert.deepStrictEqual(
  directPlan.batches[0].evidence,
  directEvidence,
  "Planner must preserve documentary evidence exactly."
);

assert.strictEqual(
  directPlan.evidenceCount,
  2,
  "Planner must preserve evidence count."
);

console.log(
  "DocumentaryContextPlanner direct preservation: PASS"
);

assert.throws(
  () =>
    new DocumentaryContextPlanner(),
  /positive maxCharactersPerBatch/,
  "DocumentaryContextPlanner must not invent an implicit batch budget."
);

console.log(
  "DocumentaryContextPlanner explicit budget contract: PASS"
);
