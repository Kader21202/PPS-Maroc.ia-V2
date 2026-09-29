"use strict";

const assert = require("assert");

const {
  PromptRequestExecutor
} = require(
  "../src/services/PromptRequestExecutor"
);

const {
  AIProviderHttpError
} = require(
  "../src/providers/AIProviderHttpError"
);

(async () => {
  let classifierCalls = 0;
  let capturedClassification = null;

  const measurer = {
    measure() {
      return {
        inputTokens: null,
        characters: 100,
        exact: false
      };
    }
  };

  const admission = {
    evaluate() {
      return {
        status: "UNKNOWN",
        reason:
          "INPUT_TOKEN_MEASUREMENT_UNAVAILABLE"
      };
    }
  };

  const errorClassifier = {
    classify(error) {
      classifierCalls += 1;

      assert.ok(
        error instanceof AIProviderHttpError,
        "Classifier must receive the original structured provider error."
      );

      return {
        category: "RATE_LIMIT",
        dimension:
          "TOKENS_PER_MINUTE",
        status: error.status,
        provider: error.provider,
        retryAfter:
          error.retryAfter
      };
    }
  };

  const providerError =
    new AIProviderHttpError({
      provider: "groq",
      status: 413,
      statusText:
        "Payload Too Large",
      body:
        "Request too large for model. " +
        "tokens per minute (TPM): " +
        "Limit 8000, Requested 9293",
      retryAfter: null
    });

  const provider = {
    getCapabilities() {
      return {
        requestCapacity: {
          maxInputTokens: null,
          maxOutputTokens: null
        }
      };
    },

    async invoke() {
      throw providerError;
    }
  };

  const executor =
    new PromptRequestExecutor({
      measurer,
      admission,
      errorClassifier
    });

  let capturedError = null;

  try {
    await executor.execute({
      promptRequest: {
        systemPrompt: "System",
        userPrompt: "Question"
      },

      finalAnswer: {
        question:
          "Qui est Ali Yata ?"
      },

      provider
    });
  } catch (error) {
    capturedError = error;
    capturedClassification =
      error.providerClassification;
  }

  assert.strictEqual(
    classifierCalls,
    1,
    "Structured provider error must be classified exactly once."
  );

  assert.strictEqual(
    capturedError,
    providerError,
    "Classification must not replace the original provider error."
  );

  assert.deepStrictEqual(
    capturedClassification,
    {
      category: "RATE_LIMIT",
      dimension:
        "TOKENS_PER_MINUTE",
      status: 413,
      provider: "groq",
      retryAfter: null
    },
    "Classification must be attached without destroying the original error."
  );

  console.log(
    "PromptRequestExecutor.errorClassification.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
