"use strict";

class PromptRequestAdmission {
  evaluate({
    measurement,
    requestCapacity
  }) {
    if (
      !measurement ||
      typeof measurement !== "object"
    ) {
      throw new Error(
        "PromptRequestAdmission requires a valid measurement."
      );
    }

    if (
      !requestCapacity ||
      typeof requestCapacity !== "object"
    ) {
      return {
        status: "UNKNOWN",
        reason: "REQUEST_CAPACITY_UNAVAILABLE"
      };
    }

    const inputTokens =
      measurement.inputTokens;

    const maxInputTokens =
      requestCapacity.maxInputTokens;

    if (
      measurement.exact !== true ||
      typeof inputTokens !== "number" ||
      !Number.isFinite(inputTokens)
    ) {
      return {
        status: "UNKNOWN",
        reason: "INPUT_TOKEN_MEASUREMENT_UNAVAILABLE"
      };
    }

    if (
      typeof maxInputTokens !== "number" ||
      !Number.isFinite(maxInputTokens)
    ) {
      return {
        status: "UNKNOWN",
        reason: "MAX_INPUT_CAPACITY_UNAVAILABLE"
      };
    }

    if (inputTokens > maxInputTokens) {
      return {
        status: "OVER_CAPACITY",
        reason: "INPUT_TOKEN_CAPACITY_EXCEEDED",
        inputTokens,
        maxInputTokens
      };
    }

    return {
      status: "FIT",
      reason: "INPUT_TOKEN_CAPACITY_AVAILABLE",
      inputTokens,
      maxInputTokens
    };
  }
}

module.exports = {
  PromptRequestAdmission
};
