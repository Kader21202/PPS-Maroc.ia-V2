"use strict";

const path = require("path");

const {
  RepositoryService,
  KnowledgeFragmentFactory,
  KnowledgeBaseBuilder
} = require("../../PPS-KnowledgeBase");

const {
  CognitiveAIBuilder
} = require(
  "../../PPS-CognitiveAI-Core/src"
);

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

function startApplication({
  cognitiveCore: injectedCognitiveCore = null,
  llmProvider: injectedLLMProvider = null
} = {}) {
  const knowledgePath = path.join(
    __dirname,
    "..",
    "..",
    "PPS-KnowledgeBase",
    "knowledge"
  );

  const repositoryService =
    new RepositoryService();

  const documents =
    repositoryService.loadKnowledgeBase(
      knowledgePath
    );

  const knowledgeFragmentFactory =
    new KnowledgeFragmentFactory();

  const fragments =
    documents.flatMap(document =>
      knowledgeFragmentFactory.createFromDocument(
        document
      )
    );

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
    injectedCognitiveCore ||
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
    injectedLLMProvider ||
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

    documentsCount: documents.length,
    fragmentsCount: fragments.length,

    documents,
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
    documentsCount:
      application.documentsCount,
    fragmentsCount:
      application.fragmentsCount
  });
}

module.exports = {
  startApplication
};

