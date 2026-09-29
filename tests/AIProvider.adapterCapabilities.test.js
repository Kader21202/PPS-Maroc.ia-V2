"use strict";

const assert = require("assert");

const {
  GroqProvider
} = require(
  "../src/providers/GroqProvider"
);

const {
  MistralProvider
} = require(
  "../src/providers/MistralProvider"
);

function validateProviderCapabilities(
  name,
  provider
) {
  const capabilities =
    provider.getCapabilities();

  assert.ok(
    capabilities &&
    typeof capabilities === "object",
    `${name} must expose capabilities.`
  );

  assert.strictEqual(
    typeof capabilities.streaming,
    "boolean",
    `${name}.streaming must be boolean.`
  );

  assert.ok(
    capabilities.requestCapacity &&
    typeof capabilities.requestCapacity ===
      "object",
    `${name} must expose requestCapacity.`
  );

  assert.ok(
    capabilities.rateLimits &&
    typeof capabilities.rateLimits ===
      "object",
    `${name} must expose rateLimits.`
  );

  assert.ok(
    Object.prototype.hasOwnProperty.call(
      capabilities.requestCapacity,
      "maxInputTokens"
    ),
    `${name}.requestCapacity must expose maxInputTokens.`
  );

  assert.ok(
    Object.prototype.hasOwnProperty.call(
      capabilities.requestCapacity,
      "maxOutputTokens"
    ),
    `${name}.requestCapacity must expose maxOutputTokens.`
  );

  assert.ok(
    Object.prototype.hasOwnProperty.call(
      capabilities.rateLimits,
      "maxRequestsPerMinute"
    ),
    `${name}.rateLimits must expose maxRequestsPerMinute.`
  );

  assert.ok(
    Object.prototype.hasOwnProperty.call(
      capabilities.rateLimits,
      "maxTokensPerMinute"
    ),
    `${name}.rateLimits must expose maxTokensPerMinute.`
  );

  if (capabilities.streaming) {
    assert.strictEqual(
      typeof provider.stream,
      "function",
      `${name} declares streaming but does not implement stream().`
    );
  }

  return capabilities;
}

const groq =
  new GroqProvider({
    apiKey: "test-key"
  });

const mistral =
  new MistralProvider({
    apiKey: "test-key"
  });

const groqCapabilities =
  validateProviderCapabilities(
    "GroqProvider",
    groq
  );

const mistralCapabilities =
  validateProviderCapabilities(
    "MistralProvider",
    mistral
  );

assert.strictEqual(
  groqCapabilities.streaming,
  false,
  "GroqProvider must not declare streaming until its adapter implements stream()."
);

assert.strictEqual(
  mistralCapabilities.streaming,
  true,
  "MistralProvider implements stream() and must declare that capability."
);

console.log(
  "AIProvider.adapterCapabilities.test.js: PASS"
);
