"use strict";

const {
  DocumentaryContextBuilder
} = require(
  "../documentary/DocumentaryContextBuilder"
);

const {
  DocumentaryPipeline
} = require(
  "../documentary/DocumentaryPipeline"
);

class DocumentaryCoreFactory {
  build() {
    return {
      cognitivePipeline:
        new DocumentaryPipeline(),

      cognitiveContextBuilder:
        new DocumentaryContextBuilder()
    };
  }
}

module.exports = {
  DocumentaryCoreFactory
};
