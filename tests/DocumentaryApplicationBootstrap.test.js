"use strict";

const assert = require("assert");

const {
  startDocumentaryApplication
} = require(
  "../src/bootstrap/DocumentaryApplicationBootstrap"
);

assert.strictEqual(
  typeof startDocumentaryApplication,
  "function",
  "The documentary bootstrap must export startDocumentaryApplication."
);

console.log(
  "DocumentaryApplicationBootstrap.test.js: PASS"
);
