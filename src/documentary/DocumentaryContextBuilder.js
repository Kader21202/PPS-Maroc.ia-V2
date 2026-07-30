"use strict";

class DocumentaryContextBuilder {
  build({
    question,
    conversationContext = null,
    conversationMemory = null,
    conversationGoal = null,
    dialoguePlan = null
  }) {
    const normalizedQuestion =
      String(question || "").trim();

    if (!normalizedQuestion) {
      throw new Error(
        "DocumentaryContextBuilder requires a question."
      );
    }

    return {
      question: normalizedQuestion,

      conversationContext,
      conversationMemory,
      conversationGoal,
      dialoguePlan,

      userIntent: {
        clarificationRequired: false
      },

      cognitiveRequest: {
        question: normalizedQuestion,
        type: "documentary"
      },

      plan: {
        retrievalStrategy: "semantic",
        reasoningStrategy: "documentary"
      },

      knowledgePackage: null
    };
  }
}

module.exports = {
  DocumentaryContextBuilder
};
