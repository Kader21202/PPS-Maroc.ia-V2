"use strict";

const {
  RepositoryService
} = require(
  "../../../PPS-KnowledgeBase/src/services/RepositoryService"
);

const {
  KnowledgeFragmentFactory
} = require(
  "../../../PPS-KnowledgeBase/src/factories/KnowledgeFragmentFactory"
);

class KnowledgeBaseLoader {

  constructor() {

    this.repositoryService =
      new RepositoryService();

    this.fragmentFactory =
      new KnowledgeFragmentFactory();

  }


  load(directoryPath) {

    const documents =
      this.repositoryService
        .loadKnowledgeBase(
          directoryPath
        );


    const fragments = [];


    for (const document of documents) {

      const documentFragments =
        this.fragmentFactory
          .createFromDocument(
            document
          );

      fragments.push(
        ...documentFragments
      );

    }


    return fragments;

  }

}


module.exports = {
  KnowledgeBaseLoader
};