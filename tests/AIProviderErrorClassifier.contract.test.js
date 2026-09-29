"use strict";

const assert = require("assert");

const {
  AIProviderErrorClassifier
} = require(
  "../src/providers/AIProviderErrorClassifier"
);

const classifier =
  new AIProviderErrorClassifier();

// 1. Standard HTTP rate limit.
{
  const result =
    classifier.classify({
      provider: "groq",
      status: 429,
      statusText: "Too Many Requests",
      body: JSON.stringify({
        error: {
          message:
            "tokens per minute limit exceeded"
        }
      }),
      retryAfter: "12"
    });

  assert.strictEqual(
    result.category,
    "RATE_LIMIT"
  );

  assert.strictEqual(
    result.dimension,
    "TOKENS_PER_MINUTE"
  );

  assert.strictEqual(
    result.retryAfter,
    "12"
  );
}

// 2. Important real-world shape:
// HTTP 413 must not automatically mean request capacity
// when the provider body explicitly identifies TPM.
{
  const result =
    classifier.classify({
      provider: "groq",
      status: 413,
      statusText: "Payload Too Large",
      body:
        "Request too large for model. " +
        "tokens per minute (TPM): " +
        "Limit 8000, Requested 9293",
      retryAfter: null
    });

  assert.strictEqual(
    result.category,
    "RATE_LIMIT"
  );

  assert.strictEqual(
    result.dimension,
    "TOKENS_PER_MINUTE"
  );
}

// 3. A genuine 413 without rate-limit evidence
// remains a request-size/capacity problem.
{
  const result =
    classifier.classify({
      provider: "test-provider",
      status: 413,
      statusText: "Payload Too Large",
      body:
        "Request exceeds maximum input size.",
      retryAfter: null
    });

  assert.strictEqual(
    result.category,
    "REQUEST_TOO_LARGE"
  );

  assert.strictEqual(
    result.dimension,
    null
  );
}

// 4. Authentication.
{
  const result =
    classifier.classify({
      provider: "test-provider",
      status: 401,
      statusText: "Unauthorized",
      body: "Invalid API key.",
      retryAfter: null
    });

  assert.strictEqual(
    result.category,
    "AUTHENTICATION"
  );
}

// 5. Provider/server failure.
{
  const result =
    classifier.classify({
      provider: "test-provider",
      status: 503,
      statusText: "Service Unavailable",
      body: "",
      retryAfter: null
    });

  assert.strictEqual(
    result.category,
    "SERVER_ERROR"
  );
}

// 6. Unknown HTTP condition must remain explicit.
{
  const result =
    classifier.classify({
      provider: "test-provider",
      status: 418,
      statusText: "Unknown",
      body: "",
      retryAfter: null
    });

  assert.strictEqual(
    result.category,
    "OTHER_HTTP_ERROR"
  );
}

console.log(
  "AIProviderErrorClassifier.contract.test.js: PASS"
);
