"use strict";

const assert = require("assert");

const {
  startApplication
} = require("../src/app");

class FakePipeline {
  prepare(context) {
    context.preparedByFakeCore = true;

    context.plan = {
      retrievalStrategy: "definition",
      reasoningStrategy: "definition"
    };

    context.cognitiveRequest = {
      intent: "definition",
      subject: "test"
    };
  }

  complete(context) {
    return {
      answer: "FAKE_CORE_OK",
      summary: "Réponse produite par le faux moteur cognitif.",
      reasoningSummary:
        "Aucun ancien Core n'a été utilisé.",
      confidence: "high",
      citations: [],
      metadata: {
        reasoningStrategy: "definition",
        engine: "fake-core"
      },
      context
    };
  }

  generateClarification(context) {
    return {
      answer: "FAKE_CLARIFICATION",
      summary: "",
      reasoningSummary: "",
      confidence: "high",
      citations: [],
      metadata: {
        reasoningStrategy: "clarification"
      },
      context
    };
  }
}

class FakeContextBuilder {
  build({ question }) {
    return {
      question,
      userIntent: {
        clarificationRequired: false
      }
    };
  }
}

let providerInvocation = null;

const fakeProvider = {
  async invoke(promptRequest) {
    providerInvocation = promptRequest;

    return {
      content: "FAKE_LLM_OK",
      provider: "fake",
      model: "fake-model",
      metadata: {
        expressedWithoutLegacyCore: true
      }
    };
  }
};

const fakeCognitiveCore = {
  cognitivePipeline: new FakePipeline(),
  cognitiveContextBuilder:
    new FakeContextBuilder()
};

function isModuleLoaded(fragment) {
  return Object.keys(require.cache).some(
    modulePath => modulePath.includes(fragment)
  );
}

async function run() {
  assert.strictEqual(
    isModuleLoaded("CognitiveCoreFactory"),
    false,
    "CognitiveCoreFactory ne doit pas être chargé avant le test."
  );

  assert.strictEqual(
    isModuleLoaded("LegacyApplicationBootstrap"),
    false,
    "LegacyApplicationBootstrap ne doit pas être chargé avant le test."
  );

  assert.strictEqual(
    isModuleLoaded("PPS-CognitiveAI-Core"),
    false,
    "PPS-CognitiveAI-Core ne doit pas être chargé avant le test."
  );

  const application =
    startApplication({
      cognitiveCore: fakeCognitiveCore,
      llmProvider: fakeProvider
    });

  assert.ok(
    application.knowledgeBase,
    "La KnowledgeBase doit être construite."
  );

  assert.ok(
    application.knowledgeBaseAdapter,
    "KnowledgeBaseAdapter doit être construit."
  );

  assert.ok(
    application.cognitiveAIAdapter,
    "CognitiveAIAdapter doit être construit."
  );

  assert.ok(
    application.chatService,
    "ChatService doit être construit."
  );

  assert.ok(
    application.platformService,
    "PlatformService doit être construit."
  );

  assert.strictEqual(
    application.cognitiveCore,
    fakeCognitiveCore,
    "La plateforme doit conserver le faux Core injecté."
  );

  assert.strictEqual(
    application.llmProvider,
    fakeProvider,
    "La plateforme doit conserver le faux provider injecté."
  );

  const result =
    await application.platformService.ask(
      "Question de test sans ancien Core"
    );

  assert.strictEqual(
    result.question,
    "Question de test sans ancien Core"
  );

  assert.strictEqual(
    result.finalAnswer.answer,
    "FAKE_CORE_OK"
  );

  assert.strictEqual(
    result.answer.content,
    "FAKE_LLM_OK"
  );

  assert.strictEqual(
    result.answer.provider,
    "fake"
  );

  assert.strictEqual(
    result.answer.model,
    "fake-model"
  );

  assert.strictEqual(
    result.cognitiveContext.preparedByFakeCore,
    true
  );

  assert.ok(
    result.knowledgePackage,
    "Un KnowledgePackage doit être transmis au faux Core."
  );

  assert.ok(
    providerInvocation,
    "Le faux provider doit avoir été appelé."
  );

  assert.strictEqual(
    typeof providerInvocation.systemPrompt,
    "string"
  );

  assert.strictEqual(
    typeof providerInvocation.userPrompt,
    "string"
  );

  assert.ok(
    providerInvocation.userPrompt.includes(
      "FAKE_CORE_OK"
    ),
    "Le provider doit recevoir la réponse du faux Core."
  );

  assert.strictEqual(
    isModuleLoaded("CognitiveCoreFactory"),
    false,
    "CognitiveCoreFactory ne doit pas être chargé."
  );

  assert.strictEqual(
    isModuleLoaded("LegacyApplicationBootstrap"),
    false,
    "LegacyApplicationBootstrap ne doit pas être chargé."
  );

  assert.strictEqual(
    isModuleLoaded("PPS-CognitiveAI-Core"),
    false,
    "PPS-CognitiveAI-Core ne doit pas être chargé."
  );

  console.log(
    "✅ Application opérationnelle sans ancien Core"
  );
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
