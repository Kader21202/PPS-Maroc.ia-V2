"use strict";

const assert = require("assert");

const {
  PromptRequestExecutor
} = require(
  "../src/services/PromptRequestExecutor"
);

(async () => {
  let classifierCalls = 0;

  const runtimeError =
    new TypeError(
      "Unexpected provider implementation failure."
    );

  const executor =
    new PromptRequestExecutor({
      measurer: {
        measure() {
          return {
            inputTokens: null,
            characters: 100,
            exact: false
          };
        }
      },

      admission: {
        evaluate() {
          return {
            status: "UNKNOWN",
            reason:
              "INPUT_TOKEN_MEASUREMENT_UNAVAILABLE"
          };
        }
      },

      errorClassifier: {
        classify() {
          classifierCalls += 1;

          throw new Error(
            "Classifier must not receive ordinary runtime errors."
          );
        }
      }
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
      throw runtimeError;
    }
  };

  let capturedError = null;

  try {
    await executor.execute({
      promptRequest: {
        systemPrompt: "System",
        userPrompt: "Question"
      },

      finalAnswer: {
        question: "Question"
      },

      provider
    });
  } catch (error) {
    capturedError = error;
  }

  assert.strictEqual(
    classifierCalls,
    0,
    "Ordinary runtime errors must not be classified as provider HTTP errors."
  );

  assert.strictEqual(
    capturedError,
    runtimeError,
    "Original runtime error must propagate unchanged."
  );

  assert.strictEqual(
    capturedError.providerClassification,
    undefined,
    "Runtime error must not receive provider classification."
  );

  console.log(
    "PromptRequestExecutor.nonHttpError.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
