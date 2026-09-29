"use strict";

class AIProvider {
  invoke() {
    throw new Error(
      "invoke() must be implemented by the provider."
    );
  }

  getCapabilities() {
    return {
      streaming: false,

      requestCapacity: {
        maxInputTokens: null,
        maxOutputTokens: null
      },

      rateLimits: {
        maxRequestsPerMinute: null,
        maxTokensPerMinute: null
      }
    };
  }
}

module.exports = {
  AIProvider
};
