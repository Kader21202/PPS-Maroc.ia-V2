"use strict";

const assert = require("assert");

const {
  AIProvider
} = require(
  "../src/providers/AIProvider"
);

class InvokeOnlyProvider
  extends AIProvider {

  async invoke() {
    return {
      provider: "fake",
      content: "OK"
    };
  }
}

const provider =
  new InvokeOnlyProvider();

assert.strictEqual(
  typeof provider.getCapabilities,
  "function",
  "AIProvider must expose getCapabilities()."
);

const capabilities =
  provider.getCapabilities();

assert.ok(
  capabilities &&
  typeof capabilities === "object",
  "Provider capabilities must be an object."
);

assert.strictEqual(
  capabilities.streaming,
  false,
  "Streaming must be false by default."
);

assert.ok(
  capabilities.requestLimits &&
  typeof capabilities.requestLimits ===
    "object",
  "Provider capabilities must expose requestLimits."
);

assert.strictEqual(
  capabilities.requestLimits
    .maxInputTokens,
  null
);

assert.strictEqual(
  capabilities.requestLimits
    .maxOutputTokens,
  null
);

assert.strictEqual(
  capabilities.requestLimits
    .maxRequestsPerMinute,
  null
);

assert.strictEqual(
  capabilities.requestLimits
    .maxTokensPerMinute,
  null
);

console.log(
  "AIProvider.capabilities.test.js: PASS"
);
