"use strict";

const path = require("path");

const {
  KnowledgeBaseBuilder
} = require(
  "../../PPS-KnowledgeBase/src/builders/KnowledgeBaseBuilder"
);

const {
  CognitiveAIBuilder
} = require(
  "../../PPS-CognitiveAI-Core/src"
);

const {
  FragmentLoader
} = require("./loaders/FragmentLoader");

const {
  KnowledgeBaseAdapter
} = require("./adapters/KnowledgeBaseAdapter");

const {
  CognitiveAIAdapter
} = require("./adapters/CognitiveAIAdapter");

const {
  Guardrails
} = require("./guardrails/Guardrails");

const {
  MistralProvider
} = require("./providers/MistralProvider");

const {
  LLMService
} = require("./services/LLMService");

const {
  ChatService
} = require("./services/ChatService");

const {
  PlatformService
} = require("./services/PlatformService");

function startApplication() {
  const documentsPath = path.join(
    __dirname,
    "..",
    "data",
    "pps_knowledge"
  );

  const fragmentLoader = new FragmentLoader({
    documentsPath
  });

  const fragments = fragmentLoader.load();

  const knowledgeBaseBuilder =
    new KnowledgeBaseBuilder();

  const knowledgeBase =
    knowledgeBaseBuilder.build({
      fragments
    });

  const knowledgeBaseAdapter =
    new KnowledgeBaseAdapter({
      knowledgePackageBuilder:
        knowledgeBase.knowledgePackageBuilder
    });

  const cognitiveCore =
    new CognitiveAIBuilder().build();

  const cognitiveAIAdapter =
    new CognitiveAIAdapter({
      cognitivePipeline:
        cognitiveCore.cognitivePipeline,

      cognitiveContextBuilder:
        cognitiveCore.cognitiveContextBuilder
    });

  const guardrails =
    new Guardrails();

  const mistralProvider =
    new MistralProvider();

  const llmService =
    new LLMService(mistralProvider);

  const chatService =
    new ChatService({
      knowledgeBase: knowledgeBaseAdapter,
      cognitiveAI: cognitiveAIAdapter,
      guardrails,
      llm: llmService
    });

  const platformService =
    new PlatformService({
      guardrails,
      chatService
    });

  return {
    name: "PPS-Maroc.ia V2",
    status: "initialized",
    fragmentsCount: fragments.length,

    fragments,
    knowledgeBase,
    knowledgeBaseAdapter,

    cognitiveCore,
    cognitiveAIAdapter,

    guardrails,
    mistralProvider,
    llmService,
    chatService,
    platformService
  };
}

if (require.main === module) {
  const application =
    startApplication();

  console.log({
    name: application.name,
    status: application.status,
    fragmentsCount:
      application.fragmentsCount
  });
}

module.exports = {
  startApplication
};