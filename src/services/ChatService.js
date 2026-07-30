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
    console.log("\n===== QUESTION =====");
    console.log(question);

    if (this.guardrails) {
      this.guardrails.validateInput(question);
    }

    const cognitiveContext =
      await this.cognitiveAI.prepare({
        question
      });

    if (
      cognitiveContext.userIntent &&
      cognitiveContext.userIntent
        .clarificationRequired === true
    ) {
      const finalAnswer =
        await this.cognitiveAI
          .generateClarification(
            cognitiveContext
          );

      if (this.guardrails) {
        this.guardrails
          .validateOutput(finalAnswer);
      }

      return {
        question,
        answer: finalAnswer.answer,
        finalAnswer,
        verificationReport: null,
        knowledgePackage: null,
        cognitiveContext
      };
    }

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

    console.log(
      "\n===== KNOWLEDGE PACKAGE ====="
    );

    console.dir(
      {
        fragmentsCount:
          Array.isArray(
            knowledgePackage.fragments
          )
            ? knowledgePackage.fragments.length
            : 0,

        fragments:
          Array.isArray(
            knowledgePackage.fragments
          )
            ? knowledgePackage.fragments.map(
                (fragment, index) => ({
                  index: index + 1,
                  id: fragment.id,
                  documentId:
                    fragment.documentId,
                  sectionTitle:
                    fragment.sectionTitle
                })
              )
            : []
      },
      {
        depth: null
      }
    );

    const finalAnswer =
      await this.cognitiveAI.complete(
        cognitiveContext,
        knowledgePackage
      );

    console.log(
      "\n===== FINAL ANSWER BEFORE LLM ====="
    );

    console.dir(
      finalAnswer,
      {
        depth: null
      }
    );

    if (this.guardrails) {
      this.guardrails.validateOutput(
        finalAnswer
      );
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

    console.log("\n===== LLM ANSWER =====");
    console.dir(answer, { depth: null });

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
