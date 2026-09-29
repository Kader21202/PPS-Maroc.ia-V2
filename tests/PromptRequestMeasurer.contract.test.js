"use strict";

const assert = require("assert");

const {
  PromptRequestMeasurer
} = require(
  "../src/services/PromptRequestMeasurer"
);

const measurer =
  new PromptRequestMeasurer();

const promptRequest = {
  systemPrompt: "System",
  userPrompt: "User",
  metadata: {}
};

const measurement =
  measurer.measure(promptRequest);

assert.ok(
  measurement &&
  typeof measurement === "object",
  "PromptRequestMeasurer must return a measurement."
);

assert.ok(
  Object.prototype.hasOwnProperty.call(
    measurement,
    "inputTokens"
  ),
  "Measurement must expose inputTokens."
);

assert.ok(
  Object.prototype.hasOwnProperty.call(
    measurement,
    "measurementMethod"
  ),
  "Measurement must expose measurementMethod."
);

assert.ok(
  Object.prototype.hasOwnProperty.call(
    measurement,
    "exact"
  ),
  "Measurement must expose whether the measurement is exact."
);

console.log(
  "PromptRequestMeasurer.contract.test.js: PASS"
);
