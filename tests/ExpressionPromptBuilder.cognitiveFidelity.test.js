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
    "Les 3 et 4 août 1946, elle présente un rapport au comité central.\n" +
    "Hausse annoncée de 10 % du SMIG.\n" +
    "Renforcement de la protection sociale et de la couverture sociale.",

  confidence: 0.9,

  metadata: {
    reasoningStrategy: "assessment"
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

assert.ok(
  prompt.userPrompt.includes(
    "Ne supprime pas les qualificatifs factuels"
  ),
  "Le prompt doit protéger les qualificatifs factuels présents dans la réponse cognitive."
);

assert.ok(
  prompt.userPrompt.includes(
    "Ne remplace pas un concept par un autre"
  ),
  "Le prompt doit interdire les substitutions sémantiques non établies par le Core."
);

assert.ok(
  prompt.userPrompt.includes(
    "annoncée"
  ),
  "Le prompt doit explicitement protéger les nuances comme 'annoncée'."
);

console.log(
  "✅ Le prompt cognitif protège séparation, nuances factuelles et concepts"
);
