"use strict";

const assert = require("assert");

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
  let invokeCalls = 0;
  let sleepCalls = 0;

  const sleeper = {
    async sleep() {
      sleepCalls += 1;
    }
  };

  const policy =
    new ProviderExecutionPolicy({
      sleeper,
      maxRateLimitRetries: 1
    });

  const providerError =
    new AIProviderHttpError({
      provider: "test-provider",
      status: 413,
      statusText:
        "Payload Too Large",
      body:
        "tokens per minute (TPM) limit exceeded",
      retryAfter: null
    });

  providerError.providerClassification = {
    category: "RATE_LIMIT",
    dimension:
      "TOKENS_PER_MINUTE",
    status: 413,
    provider:
      "test-provider",
    retryAfter: null
  };

  let capturedError = null;

  try {
    await policy.execute(
      async () => {
        invokeCalls += 1;
        throw providerError;
      }
    );
  } catch (error) {
    capturedError = error;
  }

  assert.strictEqual(
    invokeCalls,
    1,
    "A rate limit without usable retry timing must not be blindly retried."
  );

  assert.strictEqual(
    sleepCalls,
    0,
    "A rate limit without Retry-After must not invent a wait duration."
  );

  assert.strictEqual(
    capturedError,
    providerError,
    "The original provider error must propagate unchanged."
  );

  console.log(
    "ProviderExecutionPolicy.missingRetryAfter.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
