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
  question: "Qui est Ali Yata ?",

  answer:
    "Ali Yata est une figure centrale du mouvement progressiste marocain.",

  summary:
    "Biographie d'Ali Yata.",

  confidence: 0.9,

  citations: [],

  metadata: {
    reasoningStrategy: "definition"
  }
};

const prompt =
  builder.build(finalAnswer);

console.log(prompt.userPrompt);

assert.ok(
  prompt.userPrompt.includes(
    finalAnswer.answer
  ),
  "La réponse produite par le Core cognitif doit être transmise au LLM."
);

assert.ok(
  !prompt.userPrompt.includes(
    "Aucune preuve documentaire disponible."
  ),
  "Un FinalAnswer cognitif valide ne doit pas être traité comme une absence de preuves."
);

console.log(
  "✅ ExpressionPromptBuilder accepte un FinalAnswer cognitif"
);
