"use strict";

const assert = require("assert");

const {
  AIProvider
} = require("../src/providers/AIProvider");

class TestProvider extends AIProvider {
  async invoke() {
    return {
      provider: "test",
      content: "OK"
    };
  }
}

const provider =
  new TestProvider();

const capabilities =
  provider.getCapabilities();

assert.ok(
  capabilities.requestCapacity &&
  typeof capabilities.requestCapacity === "object",
  "Provider capabilities must expose requestCapacity."
);

assert.strictEqual(
  capabilities.requestCapacity.maxInputTokens,
  null,
  "maxInputTokens must belong to requestCapacity."
);

assert.strictEqual(
  capabilities.requestCapacity.maxOutputTokens,
  null,
  "maxOutputTokens must belong to requestCapacity."
);

assert.ok(
  capabilities.rateLimits &&
  typeof capabilities.rateLimits === "object",
  "Provider capabilities must expose rateLimits."
);

assert.strictEqual(
  capabilities.rateLimits.maxRequestsPerMinute,
  null,
  "maxRequestsPerMinute must belong to rateLimits."
);

assert.strictEqual(
  capabilities.rateLimits.maxTokensPerMinute,
  null,
  "maxTokensPerMinute must belong to rateLimits."
);

console.log(
  "AIProvider.capacityContract.test.js: PASS"
);
