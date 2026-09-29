"use strict";

const assert = require("assert");

const {
  AIProviderErrorClassifier
} = require(
  "../src/providers/AIProviderErrorClassifier"
);

const classifier =
  new AIProviderErrorClassifier();

// 1. HTTP 429 establishes a rate limit,
// but not its dimension.
{
  const result =
    classifier.classify({
      provider: "test-provider",
      status: 429,
      statusText: "Too Many Requests",
      body: "Quota exceeded.",
      retryAfter: "10"
    });

  assert.strictEqual(
    result.category,
    "RATE_LIMIT"
  );

  assert.strictEqual(
    result.dimension,
    null
  );
}

// 2. Generic token wording must not be
// interpreted as tokens-per-minute.
{
  const result =
    classifier.classify({
      provider: "test-provider",
      status: 413,
      statusText: "Payload Too Large",
      body:
        "The request contains too many input tokens.",
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

// 3. Retry-After alone must not transform
// a 413 into a rate-limit classification.
{
  const result =
    classifier.classify({
      provider: "test-provider",
      status: 413,
      statusText: "Payload Too Large",
      body:
        "Request exceeds maximum input size.",
      retryAfter: "30"
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

// 4. Rate-limit vocabulary alone must not
// override an unrelated HTTP status.
{
  const result =
    classifier.classify({
      provider: "test-provider",
      status: 400,
      statusText: "Bad Request",
      body:
        "TPM metadata is invalid.",
      retryAfter: null
    });

  assert.strictEqual(
    result.category,
    "OTHER_HTTP_ERROR"
  );

  assert.strictEqual(
    result.dimension,
    null
  );
}

// 5. Forbidden remains an authentication /
// authorization condition under this contract.
{
  const result =
    classifier.classify({
      provider: "test-provider",
      status: 403,
      statusText: "Forbidden",
      body: "",
      retryAfter: null
    });

  assert.strictEqual(
    result.category,
    "AUTHENTICATION"
  );
}

console.log(
  "AIProviderErrorClassifier.ambiguity.test.js: PASS"
);
