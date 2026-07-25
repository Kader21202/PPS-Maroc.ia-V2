class CognitiveAIAdapter {
  constructor({
    cognitivePipeline,
    cognitiveContextBuilder
  }) {
    if (!cognitivePipeline) {
      throw new Error(
        "CognitiveAIAdapter requires CognitivePipeline."
      );
    }

    if (!cognitiveContextBuilder) {
      throw new Error(
        "CognitiveAIAdapter requires CognitiveContextBuilder."
      );
    }

    this.cognitivePipeline = cognitivePipeline;
    this.cognitiveContextBuilder =
      cognitiveContextBuilder;
  }

  prepare({
    question,
    conversationContext = null,
    conversationMemory = null,
    conversationGoal = null,
    dialoguePlan = null
  }) {
    const context =
      this.cognitiveContextBuilder.build({
        question,
        conversationContext,
        conversationMemory,
        conversationGoal,
        dialoguePlan
      });

    this.cognitivePipeline.prepare(context);

    return context;
  }

  complete(context, knowledgePackage) {
    if (!context) {
      throw new Error(
        "CognitiveAIAdapter.complete requires CognitiveContext."
      );
    }

    if (!knowledgePackage) {
      throw new Error(
        "CognitiveAIAdapter.complete requires KnowledgePackage."
      );
    }

    context.knowledgePackage =
      knowledgePackage;

    return this.cognitivePipeline.complete(
      context
    );
  }

  process({
    question,
    knowledgePackage,
    conversationContext = null,
    conversationMemory = null,
    conversationGoal = null,
    dialoguePlan = null
  }) {
    const context = this.prepare({
      question,
      conversationContext,
      conversationMemory,
      conversationGoal,
      dialoguePlan
    });

    return this.complete(
      context,
      knowledgePackage
    );
  }
}

module.exports = {
  CognitiveAIAdapter
};