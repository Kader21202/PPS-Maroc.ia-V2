"use strict";

const {
  ExpressionPromptBuilder
} = require("../prompts/ExpressionPromptBuilder");

class LLMService {
  constructor(provider, promptBuilder = new ExpressionPromptBuilder()) {
    if (!provider || typeof provider.invoke !== "function") {
      throw new Error("LLMService requires a valid AIProvider.");
    }

    if (!promptBuilder || typeof promptBuilder.build !== "function") {
      throw new Error(
        "LLMService requires a valid ExpressionPromptBuilder."
      );
    }

    this.provider = provider;
    this.promptBuilder = promptBuilder;
  }

  async expressStream(finalAnswer, onChunk) {
    if (!finalAnswer || typeof finalAnswer !== "object") {
      throw new Error(
        "LLMService requires a valid FinalAnswer."
      );
    }

    if (typeof onChunk !== "function") {
      throw new Error(
        "LLMService.expressStream requires an onChunk callback."
      );
    }

    if (
      !this.provider ||
      typeof this.provider.stream !== "function"
    ) {
      throw new Error(
        "LLMService provider does not support streaming."
      );
    }

    const promptRequest =
      this.promptBuilder.build(finalAnswer);

    if (
      !promptRequest ||
      typeof promptRequest !== "object" ||
      typeof promptRequest.systemPrompt !== "string" ||
      typeof promptRequest.userPrompt !== "string"
    ) {
      throw new Error(
        "ExpressionPromptBuilder must return a valid prompt request."
      );
    }

    return this.provider.stream(
      promptRequest,
      onChunk
    );
  }
  async express(finalAnswer) {
  if (!finalAnswer || typeof finalAnswer !== "object") {
    throw new Error("LLMService requires a valid FinalAnswer.");
  }

  const promptRequest = this.promptBuilder.build(finalAnswer);

  if (
    !promptRequest ||
    typeof promptRequest !== "object" ||
    typeof promptRequest.systemPrompt !== "string" ||
    typeof promptRequest.userPrompt !== "string"
  ) {
    throw new Error(
      "ExpressionPromptBuilder must return a valid prompt request."
    );
  }

  return this.provider.invoke(promptRequest);
}
}

module.exports = {
  LLMService
};
