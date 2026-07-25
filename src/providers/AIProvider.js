"use strict";

class AIProvider {
  invoke(prompt) {
    throw new Error("invoke() must be implemented by the provider.");
  }
}

module.exports = {
  AIProvider
};