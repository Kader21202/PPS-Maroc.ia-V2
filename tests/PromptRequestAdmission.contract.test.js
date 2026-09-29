"use strict";

const assert = require("assert");

const {
  PromptRequestAdmission
} = require(
  "../src/services/PromptRequestAdmission"
);

const admission =
  new PromptRequestAdmission();

const fit =
  admission.evaluate({
    measurement: {
      inputTokens: 4000,
      exact: true
    },
    requestCapacity: {
      maxInputTokens: 8000,
      maxOutputTokens: null
    }
  });

assert.strictEqual(
  fit.status,
  "FIT"
);

const overflow =
  admission.evaluate({
    measurement: {
      inputTokens: 9000,
      exact: true
    },
    requestCapacity: {
      maxInputTokens: 8000,
      maxOutputTokens: null
    }
  });

assert.strictEqual(
  overflow.status,
  "OVER_CAPACITY"
);

const unknownMeasurement =
  admission.evaluate({
    measurement: {
      inputTokens: null,
      exact: false
    },
    requestCapacity: {
      maxInputTokens: 8000,
      maxOutputTokens: null
    }
  });

assert.strictEqual(
  unknownMeasurement.status,
  "UNKNOWN"
);

const unknownCapacity =
  admission.evaluate({
    measurement: {
      inputTokens: 4000,
      exact: true
    },
    requestCapacity: {
      maxInputTokens: null,
      maxOutputTokens: null
    }
  });

assert.strictEqual(
  unknownCapacity.status,
  "UNKNOWN"
);

console.log(
  "PromptRequestAdmission.contract.test.js: PASS"
);
