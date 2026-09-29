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

      requestLimits: {
        maxInputTokens: null,
        maxOutputTokens: null,
        maxRequestsPerMinute: null,
        maxTokensPerMinute: null
      }
    };
  }
}

module.exports = {
  AIProvider
};
