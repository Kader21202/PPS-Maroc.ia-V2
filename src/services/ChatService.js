"use strict";

class ChatService {
  constructor({
  knowledgeBase,
  cognitiveAI,
  renderer = null,
  guardrails = null,
  verificationService = null,
  llm = null
}) {
  if (!knowledgeBase) {
    throw new Error(
      "ChatService requires KnowledgeBaseAdapter."
    );
  }

  if (!cognitiveAI) {
    throw new Error(
      "ChatService requires CognitiveAIAdapter."
    );
  }

  if (!llm && !renderer) {
    throw new Error(
      "ChatService requires LLMService or RenderingService."
    );
  }

  this.knowledgeBase = knowledgeBase;
  this.cognitiveAI = cognitiveAI;
  this.renderer = renderer;
  this.guardrails = guardrails;
  this.verificationService = verificationService;
  this.llm = llm;
}
  async ask(question) {
    if (this.guardrails) {
      this.guardrails.validateInput(question);
    }

    const cognitiveContext =
      await this.cognitiveAI.prepare({
        question
      });

    const retrievalStrategy =
      cognitiveContext.plan?.retrievalStrategy ||
      cognitiveContext.plan?.reasoningStrategy ||
      "definition";

    const knowledgePackage =
  await this.knowledgeBase.build(
    question,
    {
      limit: 30,
      strategy: retrievalStrategy,
      cognitiveRequest:
        cognitiveContext.cognitiveRequest,
      knowledgePlan:
        cognitiveContext.plan
    }
  );
   const finalAnswer =
  await this.cognitiveAI.complete(
    cognitiveContext,
    knowledgePackage
  );

    if (this.guardrails) {
      this.guardrails.validateOutput(finalAnswer);
    }

    let verificationReport = null;

    if (this.verificationService) {
      verificationReport =
        await this.verificationService.verify(
          finalAnswer
        );

      if (!verificationReport.valid) {
        throw new Error(
          "VerificationService: FinalAnswer rejected."
        );
      }
    }

    const answer = this.llm
      ? await this.llm.express(finalAnswer)
      : this.renderer.render(finalAnswer);

    return {
      question,
      answer,
      finalAnswer,
      verificationReport,
      knowledgePackage,
      cognitiveContext
    };
  }
}

module.exports = {
  ChatService
};