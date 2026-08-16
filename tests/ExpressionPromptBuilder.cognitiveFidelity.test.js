"use strict";

const assert = require("assert");

const {
  ExpressionPromptBuilder
} = require(
  "../src/prompts/ExpressionPromptBuilder"
);

const builder =
  new ExpressionPromptBuilder();

const finalAnswer = {
  question: "Question de test",

  answer:
    "En août 1946, la personne rencontre le chef de l'État.\n" +
    "Les 3 et 4 août 1946, elle présente un rapport au comité central.",

  confidence: 0.9,

  metadata: {
    reasoningStrategy: "definition"
  }
};

const prompt =
  builder.build(finalAnswer);

assert.strictEqual(
  prompt.metadata.expressionMode,
  "cognitive"
);

assert.ok(
  prompt.userPrompt.includes(
    "Ne fusionne pas deux faits distincts"
  ),
  "Le prompt cognitif doit interdire explicitement la fusion de faits distincts."
);

assert.ok(
  prompt.userPrompt.includes(
    "relation temporelle"
  ),
  "Le prompt doit interdire la création implicite de relations temporelles."
);

console.log(
  "✅ Le prompt cognitif protège les faits distincts"
);
