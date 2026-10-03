"use strict";

const assert = require("assert");

const {
  startApplication
} = require("../src/app");

const {
  DocumentaryContextPlanner
} = require(
  "../src/services/DocumentaryContextPlanner"
);


class FakePipeline {
  prepare(context) {
    return context;
  }

  complete(context) {
    return context;
  }
}


class FakeContextBuilder {
  build(input) {
    return input;
  }
}


const cognitiveCore = {
  cognitivePipeline:
    new FakePipeline(),

  cognitiveContextBuilder:
    new FakeContextBuilder()
};


class ExactOverCapacityMeasurer {
  measure() {
    return {
      inputTokens: 100,
      characters: 100,
      exact: true,
      measurementMethod:
        "integration-exact-token-count"
    };
  }
}


class FakeProvider {
  constructor() {
    this.calls = [];
  }

  getCapabilities() {
    return {
      streaming: false,

      requestCapacity: {
        maxInputTokens: 50,
        maxOutputTokens: null
      },

      rateLimits: {
        maxRequestsPerMinute: null,
        maxTokensPerMinute: null
      }
    };
  }

  async invoke(promptRequest) {
    this.calls.push(promptRequest);

    /*
     * Documentary extraction requests ask for JSON.
     */
    if (
      typeof promptRequest.systemPrompt === "string" &&
      promptRequest.systemPrompt.includes(
        "JSON"
      )
    ) {
      const ids = [
        ...promptRequest.userPrompt.matchAll(
          /FRAGMENT_ID:\s*([^\n]+)/g
        )
      ].map(match => match[1].trim());

      return {
        provider: "fake",

        content: JSON.stringify({
          facts: ids.map(
            (fragmentId, index) => ({
              text:
                `Fait extrait ${index + 1}.`,
              fragmentIds: [
                fragmentId
              ]
            })
          )
        })
      };
    }

    /*
     * The only non-extraction invocation expected
     * after overflow is the terminal synthesis.
     */
    return {
      provider: "fake",
      content:
        "Réponse finale synthétisée."
    };
  }
}


(async () => {
  const provider =
    new FakeProvider();

  const measurer =
    new ExactOverCapacityMeasurer();

  const application =
    startApplication({
      cognitiveCore,
      llmProvider: provider,

      requestExecution: {
        measurer,

        documentaryPlanner:
          new DocumentaryContextPlanner({
            maxCharactersPerBatch: 100
          })
      }
    });

  const finalAnswer = {
    question:
      "Question documentaire d'intégration",

    answer: "",

    documentaryEvidence: [
      {
        index: 0,
        fragmentId: "F1",
        documentId: "D1",
        sectionTitle: "Section 1",
        text:
          "Premier fragment documentaire.",
        sources: []
      },
      {
        index: 1,
        fragmentId: "F2",
        documentId: "D2",
        sectionTitle: "Section 2",
        text:
          "Deuxième fragment documentaire.",
        sources: []
      }
    ],

    citations: [],

    confidence: {
      level: "documentary"
    },

    metadata: {
      reasoningStrategy:
        "documentary"
    }
  };

  const result =
    await application.llmService.express(
      finalAnswer
    );

  assert.strictEqual(
    result.content,
    "Réponse finale synthétisée.",
    "Integrated overflow must return the terminal synthesis result."
  );

  assert.ok(
    provider.calls.length >= 2,
    "Overflow must perform documentary extraction before final synthesis."
  );

  const originalRawInvocation =
    provider.calls.find(call =>
      typeof call.userPrompt === "string" &&
      call.userPrompt.includes(
        "Premier fragment documentaire."
      ) &&
      call.metadata?.operation !==
        "documentary-final-synthesis"
    );

  assert.ok(
    originalRawInvocation,
    "Documentary evidence must be processed during overflow."
  );

  const finalCall =
    provider.calls[
      provider.calls.length - 1
    ];

  assert.strictEqual(
    finalCall.metadata?.operation,
    "documentary-final-synthesis",
    "Last provider call must be the final documentary synthesis."
  );

  assert.strictEqual(
    finalCall.userPrompt.includes(
      "Premier fragment documentaire."
    ),
    false,
    "Final synthesis must not re-inject raw documentary evidence."
  );

  assert.strictEqual(
    finalCall.userPrompt.includes(
      "Fait extrait"
    ),
    true,
    "Final synthesis must use extracted consolidated facts."
  );

  console.log(
    "ApplicationDocumentaryOverflow.integration.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
