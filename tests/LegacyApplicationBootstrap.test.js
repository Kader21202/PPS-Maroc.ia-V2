"use strict";

const assert = require("assert");

const {
  startLegacyApplication
} = require(
  "../src/bootstrap/LegacyApplicationBootstrap"
);

assert.strictEqual(
  typeof startLegacyApplication,
  "function"
);

console.log(
  "✅ LegacyApplicationBootstrap export validé"
);
