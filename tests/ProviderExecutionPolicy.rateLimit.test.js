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
  const waits = [];

  const sleeper = {
    async sleep(milliseconds) {
      waits.push(milliseconds);
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
      status: 429,
      statusText:
        "Too Many Requests",
      body:
        "tokens per minute (TPM) limit exceeded",
      retryAfter: "2"
    });

  const operation =
    async () => {
      invokeCalls += 1;

      if (invokeCalls === 1) {
        providerError.providerClassification = {
          category: "RATE_LIMIT",
          dimension:
            "TOKENS_PER_MINUTE",
          status: 429,
          provider:
            "test-provider",
          retryAfter: "2"
        };

        throw providerError;
      }

      return {
        provider: "test-provider",
        content: "OK"
      };
    };

  const result =
    await policy.execute(operation);

  assert.strictEqual(
    invokeCalls,
    2,
    "A recoverable rate limit must be retried exactly once."
  );

  assert.deepStrictEqual(
    waits,
    [2000],
    "Retry-After seconds must control the wait before retry."
  );

  assert.strictEqual(
    result.content,
    "OK"
  );

  console.log(
    "ProviderExecutionPolicy.rateLimit.test.js: PASS"
  );
})().catch(error => {
  console.error(error);
  process.exit(1);
});
