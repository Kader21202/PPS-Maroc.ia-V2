"use strict";

class ProviderExecutionPolicy {
  constructor({
    sleeper = null,
    maxRateLimitRetries = 1
  } = {}) {
    if (
      sleeper !== null &&
      (
        typeof sleeper !== "object" ||
        typeof sleeper.sleep !== "function"
      )
    ) {
      throw new Error(
        "ProviderExecutionPolicy requires a valid sleeper."
      );
    }

    if (
      !Number.isInteger(maxRateLimitRetries) ||
      maxRateLimitRetries < 0
    ) {
      throw new Error(
        "ProviderExecutionPolicy requires a non-negative maxRateLimitRetries."
      );
    }

    this.sleeper =
      sleeper || {
        sleep(milliseconds) {
          return new Promise(resolve =>
            setTimeout(resolve, milliseconds)
          );
        }
      };

    this.maxRateLimitRetries =
      maxRateLimitRetries;
  }

  async execute(operation) {
    if (typeof operation !== "function") {
      throw new Error(
        "ProviderExecutionPolicy requires an operation."
      );
    }

    let retries = 0;

    while (true) {
      try {
        return await operation();
      } catch (error) {
        const classification =
          error &&
          typeof error === "object"
            ? error.providerClassification
            : null;

        if (
          !classification ||
          classification.category !==
            "RATE_LIMIT"
        ) {
          throw error;
        }

        if (
          retries >=
          this.maxRateLimitRetries
        ) {
          throw error;
        }

        const retryAfter =
          classification.retryAfter;

        const retryAfterSeconds =
          typeof retryAfter === "number"
            ? retryAfter
            : (
                typeof retryAfter === "string" &&
                retryAfter.trim()
                  ? Number(retryAfter)
                  : NaN
              );

        if (
          !Number.isFinite(
            retryAfterSeconds
          ) ||
          retryAfterSeconds <= 0
        ) {
          throw error;
        }

        await this.sleeper.sleep(
          retryAfterSeconds * 1000
        );

        retries += 1;
      }
    }
  }
}

module.exports = {
  ProviderExecutionPolicy
};
