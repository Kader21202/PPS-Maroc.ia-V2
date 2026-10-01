"use strict";

const {
  PromptRequestMeasurer
} = require(
  "./PromptRequestMeasurer"
);

const {
  PromptRequestAdmission
} = require(
  "./PromptRequestAdmission"
);

const {
  AIProviderErrorClassifier
} = require(
  "../providers/AIProviderErrorClassifier"
);

class PromptRequestExecutor {
  constructor({
    measurer =
      new PromptRequestMeasurer(),

    admission =
      new PromptRequestAdmission(),

    overflowHandler = null,

    errorClassifier =
      new AIProviderErrorClassifier(),

    executionPolicy = null
  } = {}) {
    if (
      !measurer ||
      typeof measurer.measure !== "function"
    ) {
      throw new Error(
        "PromptRequestExecutor requires a valid PromptRequestMeasurer."
      );
    }

    if (
      !admission ||
      typeof admission.evaluate !== "function"
    ) {
      throw new Error(
        "PromptRequestExecutor requires a valid PromptRequestAdmission."
      );
    }

    if (
      overflowHandler !== null &&
      (
        typeof overflowHandler !== "object" ||
        typeof overflowHandler.execute !== "function"
      )
    ) {
      throw new Error(
        "PromptRequestExecutor requires a valid overflow handler."
      );
    }

    if (
      !errorClassifier ||
      typeof errorClassifier.classify !== "function"
    ) {
      throw new Error(
        "PromptRequestExecutor requires a valid AIProviderErrorClassifier."
      );
    }

    this.measurer = measurer;
    this.admission = admission;
    this.overflowHandler =
      overflowHandler;
    if (
      executionPolicy !== null &&
      (
        typeof executionPolicy !== "object" ||
        typeof executionPolicy.execute !== "function"
      )
    ) {
      throw new Error(
        "PromptRequestExecutor requires a valid execution policy."
      );
    }

    this.errorClassifier =
      errorClassifier;

    this.executionPolicy =
      executionPolicy;
  }

  async _invokeProvider(
    provider,
    promptRequest
  ) {
    try {
      return await provider.invoke(
        promptRequest
      );
    } catch (error) {
      /*
       * Only structured provider HTTP errors are
       * candidates for provider classification.
       *
       * Local programming/runtime errors must
       * propagate unchanged.
       */
      if (
        error &&
        typeof error === "object" &&
        typeof error.status === "number" &&
        Number.isFinite(error.status)
      ) {
        const classification =
          this.errorClassifier.classify(
            error
          );

        error.providerClassification =
          classification;
      }

      throw error;
    }
  }

  async execute({
    promptRequest,
    finalAnswer,
    provider
  }) {
    if (
      !promptRequest ||
      typeof promptRequest !== "object"
    ) {
      throw new Error(
        "PromptRequestExecutor requires a valid PromptRequest."
      );
    }

    if (
      !provider ||
      typeof provider.invoke !== "function"
    ) {
      throw new Error(
        "PromptRequestExecutor requires a valid AIProvider."
      );
    }

    const measurement =
      this.measurer.measure(
        promptRequest
      );

    const capabilities =
      typeof provider.getCapabilities ===
        "function"
        ? provider.getCapabilities()
        : null;

    const requestCapacity =
      capabilities &&
      capabilities.requestCapacity
        ? capabilities.requestCapacity
        : null;

    const admission =
      this.admission.evaluate({
        measurement,
        requestCapacity
      });

    if (
      !admission ||
      typeof admission.status !== "string"
    ) {
      throw new Error(
        "PromptRequestAdmission must return a valid admission decision."
      );
    }

    switch (admission.status) {
      case "FIT":
      case "UNKNOWN":
        if (this.executionPolicy) {
          return this.executionPolicy.execute(
            () =>
              this._invokeProvider(
                provider,
                promptRequest
              )
          );
        }

        return this._invokeProvider(
          provider,
          promptRequest
        );

      case "OVER_CAPACITY":
        if (this.overflowHandler) {
          return this.overflowHandler.execute({
            promptRequest,
            finalAnswer,
            provider,
            measurement,
            admission
          });
        }

        throw new Error(
          "PromptRequest exceeds provider request capacity."
        );

      default:
        throw new Error(
          `Unsupported PromptRequest admission status: ${admission.status}`
        );
    }
  }
}

module.exports = {
  PromptRequestExecutor
};
