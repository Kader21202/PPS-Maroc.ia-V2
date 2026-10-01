"use strict";

const path = require("path");

const {
  RepositoryService,
  KnowledgeFragmentFactory,
  KnowledgeBaseBuilder
} = require("../../PPS-KnowledgeBase");

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
  LLMService
} = require("./services/LLMService");

const {
  PromptRequestExecutor
} = require("./services/PromptRequestExecutor");

const {
  DocumentaryContextPlanner
} = require("./services/DocumentaryContextPlanner");

const {
  DocumentaryEvidenceExtractor
} = require("./services/DocumentaryEvidenceExtractor");

const {
  DocumentaryBatchProcessor
} = require("./services/DocumentaryBatchProcessor");

const {
  DocumentaryConsolidator
} = require("./services/DocumentaryConsolidator");

const {
  DocumentaryOverflowHandler
} = require("./services/DocumentaryOverflowHandler");

const {
  DocumentarySynthesisPromptBuilder
} = require("./prompts/DocumentarySynthesisPromptBuilder");

const {
  ChatService
} = require("./services/ChatService");

const {
  PlatformService
} = require("./services/PlatformService");

function startApplication({
  cognitiveCore,
  llmProvider,
  requestExecution = {}
} = {}) {
  if (!cognitiveCore) {
    throw new Error(
      "startApplication requires a cognitiveCore."
    );
  }

  if (!llmProvider) {
    throw new Error(
      "startApplication requires an llmProvider."
    );
  }
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

  const cognitiveAIAdapter =
    new CognitiveAIAdapter({
      cognitivePipeline:
        cognitiveCore.cognitivePipeline,

      cognitiveContextBuilder:
        cognitiveCore.cognitiveContextBuilder
    });

  const guardrails =
    new Guardrails();

  const documentaryPlanner =
    new DocumentaryContextPlanner();

  const documentaryExtractor =
    new DocumentaryEvidenceExtractor({
      provider: llmProvider
    });

  const documentaryProcessor =
    new DocumentaryBatchProcessor({
      extractor: documentaryExtractor
    });

  const documentaryConsolidator =
    new DocumentaryConsolidator();

  const documentarySynthesisPromptBuilder =
    new DocumentarySynthesisPromptBuilder();

  const terminalRequestExecutor =
    new PromptRequestExecutor();

  const documentaryOverflowHandler =
    new DocumentaryOverflowHandler({
      planner: documentaryPlanner,
      processor: documentaryProcessor,
      consolidator: documentaryConsolidator,
      synthesisPromptBuilder:
        documentarySynthesisPromptBuilder,
      requestExecutor:
        terminalRequestExecutor
    });

  const requestExecutor =
    new PromptRequestExecutor({
      measurer:
        requestExecution.measurer,
      overflowHandler:
        documentaryOverflowHandler
    });

  const llmService =
    new LLMService(
      llmProvider,
      undefined,
      requestExecutor
    );

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
    llmProvider,
    requestExecutor,
    llmService,
    chatService,
    platformService
  };
}

module.exports = {
  startApplication
};

