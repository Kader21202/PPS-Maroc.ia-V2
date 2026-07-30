"use strict";

const assert = require("assert");

const {
  DocumentaryCoreFactory
} = require(
  "../src/bootstrap/DocumentaryCoreFactory"
);

const factory =
  new DocumentaryCoreFactory();

const core = factory.build();

assert.ok(
  core.cognitivePipeline,
  "Factory must provide cognitivePipeline."
);

assert.ok(
  core.cognitiveContextBuilder,
  "Factory must provide cognitiveContextBuilder."
);

assert.strictEqual(
  typeof core.cognitivePipeline.prepare,
  "function"
);

assert.strictEqual(
  typeof core.cognitivePipeline.complete,
  "function"
);

assert.strictEqual(
  typeof core.cognitivePipeline
    .generateClarification,
  "function"
);

assert.strictEqual(
  typeof core.cognitiveContextBuilder.build,
  "function"
);

console.log(
  "DocumentaryCoreFactory.test.js: PASS"
);
