"use strict";

const assert = require("assert");

const {
  PromptRequestExecutor
} = require(
  "../src/services/PromptRequestExecutor"
);

const {
  ProviderExecutionPolicy
} = require(
  "../src/services/ProviderExecutionPolicy"
);

const {
  AIProviderHttpError
} = require(
  "../src/providers/AIProviderHttpError"
);

(async () => {
  let providerCalls = 0;
  const waits = [];

  const sleeper = {
    async sleep(milliseconds) {
      waits.push(milliseconds);
    }
  };

  const executionPolicy =
    new ProviderExecutionPolicy({
      sleeper,
      maxRateLimitRetries: 1
    });

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

      if (providerCalls === 1) {
        throw new AIProviderHttpError({
          provider: "test-provider",
          status: 429,
          statusText:
            "Too Many Requests",
          body:
            "tokens per minute (TPM) limit exceeded",
          retryAfter: "2"
        });
      }

      return {
        provider: "test-provider",
        content: "Recovered"
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
    providerCalls,
    2,
    "Provider must be invoked once initially and once after recovery."
  );

  assert.deepStrictEqual(
    waits,
    [2000],
    "Retry-After must determine the recovery wait."
  );

  assert.strictEqual(
    result.content,
    "Recovered"
  );

  console.log(
    "PromptRequestExecutor.rateLimitRecovery.integration.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
