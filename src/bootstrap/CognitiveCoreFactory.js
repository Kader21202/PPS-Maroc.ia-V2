"use strict";

const {
  CognitiveAIBuilder
} = require(
  "../../../PPS-CognitiveAI-Core/src"
);

class CognitiveCoreFactory {
  build() {
    return new CognitiveAIBuilder().build();
  }
}

module.exports = {
  CognitiveCoreFactory
};
