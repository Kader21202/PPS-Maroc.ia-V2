"use strict";

class ChatService {
  constructor({
    knowledgeBase,
    cognitiveAI,
    renderer = null,
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
    this.verificationService =
      verificationService;
    this.llm = llm;
  }

  async _prepareFinalAnswer(question) {

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


      return {
        finalAnswer,
        verificationReport: null,
        knowledgePackage: null,
        cognitiveContext,
        clarificationRequired: true
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

    const finalAnswer =
      await this.cognitiveAI.complete(
        cognitiveContext,
        knowledgePackage
      );


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

    return {
      finalAnswer,
      verificationReport,
      knowledgePackage,
      cognitiveContext,
      clarificationRequired: false
    };
  }

  async askStream(question, onChunk) {
    if (typeof onChunk !== "function") {
      throw new Error(
        "ChatService.askStream requires an onChunk callback."
      );
    }

    if (!this.llm) {
      throw new Error(
        "ChatService streaming requires LLMService."
      );
    }

    if (
      typeof this.llm.expressStream !==
      "function"
    ) {
      throw new Error(
        "LLMService does not support streaming."
      );
    }

    const prepared =
      await this._prepareFinalAnswer(
        question
      );

    if (prepared.clarificationRequired) {
      return {
        question,
        answer:
          prepared.finalAnswer.answer,
        finalAnswer:
          prepared.finalAnswer,
        verificationReport:
          prepared.verificationReport,
        knowledgePackage:
          prepared.knowledgePackage,
        cognitiveContext:
          prepared.cognitiveContext
      };
    }

    const answer =
      await this.llm.expressStream(
        prepared.finalAnswer,
        onChunk
      );

    return {
      question,
      answer,
      finalAnswer:
        prepared.finalAnswer,
      verificationReport:
        prepared.verificationReport,
      knowledgePackage:
        prepared.knowledgePackage,
      cognitiveContext:
        prepared.cognitiveContext
    };
  }

  async ask(question) {
    console.log("\n===== QUESTION =====");
    console.log(question);

    const prepared =
      await this._prepareFinalAnswer(
        question
      );

    if (prepared.clarificationRequired) {
      return {
        question,
        answer:
          prepared.finalAnswer.answer,
        finalAnswer:
          prepared.finalAnswer,
        verificationReport:
          prepared.verificationReport,
        knowledgePackage:
          prepared.knowledgePackage,
        cognitiveContext:
          prepared.cognitiveContext
      };
    }

    console.log(
      "\n===== KNOWLEDGE PACKAGE ====="
    );

    console.dir(
      {
        fragmentsCount:
          Array.isArray(
            prepared.knowledgePackage
              ?.fragments
          )
            ? prepared.knowledgePackage
                .fragments.length
            : 0,

        fragments:
          Array.isArray(
            prepared.knowledgePackage
              ?.fragments
          )
            ? prepared.knowledgePackage
                .fragments.map(
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

    console.log(
      "\n===== FINAL ANSWER BEFORE LLM ====="
    );

    console.dir(
      prepared.finalAnswer,
      {
        depth: null
      }
    );

    const answer = this.llm
      ? await this.llm.express(
          prepared.finalAnswer
        )
      : this.renderer.render(
          prepared.finalAnswer
        );

    console.log("\n===== LLM ANSWER =====");
    console.dir(answer, {
      depth: null
    });

    return {
      question,
      answer,
      finalAnswer:
        prepared.finalAnswer,
      verificationReport:
        prepared.verificationReport,
      knowledgePackage:
        prepared.knowledgePackage,
      cognitiveContext:
        prepared.cognitiveContext
    };
  }
}

module.exports = {
  ChatService
};
