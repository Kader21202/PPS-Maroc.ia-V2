"use strict";

const path = require("path");

const {
  KnowledgeBaseLoader
} = require(
  "../../src/loaders/KnowledgeBaseLoader"
);

const {
  KnowledgeBaseAdapter
} = require(
  "../../src/adapters/KnowledgeBaseAdapter"
);

const {
  CognitiveAIAdapter
} = require(
  "../../src/adapters/CognitiveAIAdapter"
);

const {
  CognitiveAIBuilder
} = require(
  "C:/Users/HP/Desktop/PPS-CognitiveAI-Core/src"
);


const knowledgePath =
  "C:/Users/HP/Desktop/PPS-KnowledgeBase/knowledge";


const loader =
  new KnowledgeBaseLoader();


const fragments =
  loader.load(
    knowledgePath
  );


console.log(
  "Fragments chargés:",
  fragments.length
);


const kbAdapter =
  new KnowledgeBaseAdapter({
    knowledgePackageBuilder:
      new (require(
        "C:/Users/HP/Desktop/PPS-KnowledgeBase/src/builders/KnowledgePackageBuilder"
      ).KnowledgePackageBuilder)({
        retriever:
          new (require(
            "C:/Users/HP/Desktop/PPS-KnowledgeBase/src/retrievers/KnowledgeRetriever"
          ).KnowledgeRetriever)({
            index:
              (() => {

                const {
                  FragmentIndex
                } =
                require(
                  "C:/Users/HP/Desktop/PPS-KnowledgeBase/src/indexes/FragmentIndex"
                );

                const index =
                  new FragmentIndex();

                index.build(
                  fragments
                );

                return index;

              })()
          })
      })
});


const knowledgePackage =
  kbAdapter.build(
    "Qui est Ali Yata ?"
  );


console.log(
  "Knowledge fragments:",
  knowledgePackage.fragments.length
);



const cognitiveCore =
  new CognitiveAIBuilder()
    .build();


const cognitiveAdapter =
  new CognitiveAIAdapter({
    cognitivePipeline:
      cognitiveCore.cognitivePipeline,

    cognitiveContextBuilder:
      cognitiveCore.cognitiveContextBuilder
  });


const result =
  cognitiveAdapter.process({
    question:
      "Qui est Ali Yata ?",

    knowledgePackage
  });


console.log(
  result.answer
);


if (!result.answer) {
  throw new Error(
    "Aucune réponse générée."
  );
}


console.log(
  "✅ FULL INTEGRATION PPS-Maroc.ia-V2 + PPS-KnowledgeBase + PPS-CognitiveAI-Core VALIDÉE"
);