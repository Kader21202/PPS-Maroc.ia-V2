"use strict";

const assert = require("assert");

const {
  AIProviderHttpError
} = require(
  "../src/providers/AIProviderHttpError"
);

const error =
  new AIProviderHttpError({
    provider: "test-provider",
    status: 429,
    statusText: "Too Many Requests",
    body: "rate limit",
    retryAfter: "12"
  });

assert.ok(
  error instanceof Error
);

assert.strictEqual(
  error.name,
  "AIProviderHttpError"
);

assert.strictEqual(
  error.provider,
  "test-provider"
);

assert.strictEqual(
  error.status,
  429
);

assert.strictEqual(
  error.statusText,
  "Too Many Requests"
);

assert.strictEqual(
  error.body,
  "rate limit"
);

assert.strictEqual(
  error.retryAfter,
  "12"
);

assert.match(
  error.message,
  /429 Too Many Requests/
);

console.log(
  "AIProviderHttpError.contract.test.js: PASS"
);
