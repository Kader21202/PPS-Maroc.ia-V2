"use strict";

class Guardrails {
  validateInput(input) {
    if (typeof input !== "string") {
      throw new Error("Input must be a string.");
    }

    if (input.trim().length === 0) {
      throw new Error("Input cannot be empty.");
    }

    return true;
  }

  validateOutput(output) {
    if (output === null || output === undefined) {
      throw new Error("Output is required.");
    }

    if (
      typeof output !== "string" &&
      typeof output !== "object"
    ) {
      throw new Error(
        "Output must be a string or an object."
      );
    }

    if (
      typeof output === "string" &&
      output.trim().length === 0
    ) {
      throw new Error("Output cannot be empty.");
    }

    if (
      typeof output === "object" &&
      !Array.isArray(output) &&
      Object.keys(output).length === 0
    ) {
      throw new Error("Output object cannot be empty.");
    }

    return true;
  }
}

module.exports = {
  Guardrails
};
