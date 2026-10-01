"use strict";

const assert = require("assert");

const {
  PromptRequestExecutor
} = require(
  "../src/services/PromptRequestExecutor"
);

(async () => {
  let policyCalls = 0;
  let providerCalls = 0;

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

  const executionPolicy = {
    async execute(operation) {
      policyCalls += 1;

      assert.strictEqual(
        typeof operation,
        "function",
        "Execution policy must receive the provider operation."
      );

      return operation();
    }
  };

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
      providerCalls += 1;

      return {
        provider: "test-provider",
        content: "OK"
      };
    }
  };

  const executor =
    new PromptRequestExecutor({
      measurer,
      admission,
      executionPolicy
    });

  const result =
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

  assert.strictEqual(
    policyCalls,
    1,
    "Provider invocation must pass through the execution policy."
  );

  assert.strictEqual(
    providerCalls,
    1,
    "Provider must still be invoked exactly once."
  );

  assert.strictEqual(
    result.content,
    "OK"
  );

  console.log(
    "PromptRequestExecutor.executionPolicy.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
