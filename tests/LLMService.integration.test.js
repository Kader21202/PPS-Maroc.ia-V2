"use strict";

const {
  LLMService
} = require("../src/services/LLMService");

const {
  MistralProvider
} = require("../src/providers/MistralProvider");

async function runTest() {
  const provider = new MistralProvider();
  const llmService = new LLMService(provider);

  const finalAnswer = {
    answer: "Le PPS a été créé le 20 décembre 1974.",
    summary: "Création du PPS en 1974.",
    reasoningSummary:
      "La réponse repose sur les connaissances fournies par le moteur cognitif.",
    confidence: 0.95,
    citations: [
      {
        source: "document-test.txt",
        fragmentId: "fragment-1"
      }
    ],
    metadata: {
      reasoningStrategy: "factual"
    }
  };

  const result = await llmService.express(finalAnswer);

  console.log(result.provider === "mistral");
  console.log(typeof result.model === "string");
  console.log(result.model.length > 0);
  console.log(typeof result.content === "string");
  console.log(result.content.length > 0);
  console.log(
    result.metadata.reasoningStrategy === "factual"
  );
}

runTest().catch((error) => {
  console.error(error);
  process.exit(1);
});