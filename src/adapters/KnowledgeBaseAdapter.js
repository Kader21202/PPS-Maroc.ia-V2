class KnowledgeBaseAdapter {

  constructor({
    knowledgePackageBuilder
  }) {

    if (!knowledgePackageBuilder) {
      throw new Error(
        "KnowledgeBaseAdapter requires KnowledgePackageBuilder."
      );
    }

    this.knowledgePackageBuilder =
      knowledgePackageBuilder;

  }

  build(
    question,
    options = {}
  ) {

    return this.knowledgePackageBuilder.build(
      question,
      options
    );

  }

}

module.exports = {
  KnowledgeBaseAdapter
};