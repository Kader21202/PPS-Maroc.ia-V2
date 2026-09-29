"use strict";

const assert = require("assert");

const {
  LLMService
} = require("../src/services/LLMService");

const {
  AIProvider
} = require("../src/providers/AIProvider");

class IntegrationProvider extends AIProvider {
  constructor() {
    super();
    this.lastPromptRequest = null;
  }

  async invoke(promptRequest) {
    this.lastPromptRequest = promptRequest;

    return {
      provider: "integration",
      model: "integration-model",
      content: "Réponse générée.",
      metadata: promptRequest.metadata
    };
  }
}

(async () => {
  const provider =
    new IntegrationProvider();

  const llmService =
    new LLMService(provider);

  const finalAnswer = {
    answer:
      "Le PPS a été créé le 20 décembre 1974.",
    summary:
      "Création du PPS en 1974.",
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

  const result =
    await llmService.express(finalAnswer);

  assert.ok(
    provider.lastPromptRequest,
    "LLMService must send a prompt request to the provider."
  );

  assert.strictEqual(
    typeof provider.lastPromptRequest.systemPrompt,
    "string"
  );

  assert.ok(
    provider.lastPromptRequest.systemPrompt.length > 0
  );

  assert.strictEqual(
    typeof provider.lastPromptRequest.userPrompt,
    "string"
  );

  assert.ok(
    provider.lastPromptRequest.userPrompt.length > 0
  );

  assert.strictEqual(
    result.provider,
    "integration"
  );

  assert.strictEqual(
    result.model,
    "integration-model"
  );

  assert.strictEqual(
    result.content,
    "Réponse générée."
  );

  assert.strictEqual(
    result.metadata.reasoningStrategy,
    "factual"
  );

  console.log(
    "LLMService.integration.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
