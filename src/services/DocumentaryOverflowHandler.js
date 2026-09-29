"use strict";

class DocumentaryOverflowHandler {
  constructor({
    planner,
    processor,
    consolidator,
    synthesisPromptBuilder = null,
    requestExecutor = null
  } = {}) {
    if (
      !planner ||
      typeof planner.plan !== "function"
    ) {
      throw new Error(
        "DocumentaryOverflowHandler requires a valid documentary planner."
      );
    }

    if (
      !processor ||
      typeof processor.process !== "function"
    ) {
      throw new Error(
        "DocumentaryOverflowHandler requires a valid documentary batch processor."
      );
    }

    if (
      !consolidator ||
      typeof consolidator.consolidate !== "function"
    ) {
      throw new Error(
        "DocumentaryOverflowHandler requires a valid documentary consolidator."
      );
    }

    if (
      synthesisPromptBuilder !== null &&
      (
        typeof synthesisPromptBuilder !== "object" ||
        typeof synthesisPromptBuilder.build !== "function"
      )
    ) {
      throw new Error(
        "DocumentaryOverflowHandler requires a valid documentary synthesis prompt builder."
      );
    }

    if (
      requestExecutor !== null &&
      (
        typeof requestExecutor !== "object" ||
        typeof requestExecutor.execute !== "function"
      )
    ) {
      throw new Error(
        "DocumentaryOverflowHandler requires a valid request executor."
      );
    }

    this.planner = planner;
    this.processor = processor;
    this.consolidator = consolidator;
    this.synthesisPromptBuilder =
      synthesisPromptBuilder;
    this.requestExecutor =
      requestExecutor;
  }

  async execute({
    promptRequest,
    finalAnswer,
    provider,
    measurement,
    admission
  } = {}) {
    if (
      !finalAnswer ||
      typeof finalAnswer !== "object"
    ) {
      throw new Error(
        "DocumentaryOverflowHandler requires a valid FinalAnswer."
      );
    }

    if (
      typeof finalAnswer.question !== "string" ||
      !finalAnswer.question.trim()
    ) {
      throw new Error(
        "DocumentaryOverflowHandler requires a documentary question."
      );
    }

    const plan =
      this.planner.plan(
        finalAnswer
      );

    const processorResult =
      await this.processor.process({
        question:
          finalAnswer.question.trim(),
        plan
      });

    const consolidation =
      this.consolidator.consolidate(
        processorResult
      );

    if (!this.synthesisPromptBuilder) {
      return consolidation;
    }

    if (
      !provider ||
      typeof provider.invoke !== "function"
    ) {
      throw new Error(
        "DocumentaryOverflowHandler requires a valid AIProvider for final synthesis."
      );
    }

    const synthesisPromptRequest =
      this.synthesisPromptBuilder.build(
        consolidation
      );

    if (
      !synthesisPromptRequest ||
      typeof synthesisPromptRequest !== "object" ||
      typeof synthesisPromptRequest.systemPrompt !== "string" ||
      typeof synthesisPromptRequest.userPrompt !== "string"
    ) {
      throw new Error(
        "Documentary synthesis prompt builder must return a valid PromptRequest."
      );
    }

    if (this.requestExecutor) {
      return this.requestExecutor.execute({
        promptRequest:
          synthesisPromptRequest,
        finalAnswer,
        provider
      });
    }

    return provider.invoke(
      synthesisPromptRequest
    );
  }
}

module.exports = {
  DocumentaryOverflowHandler
};
