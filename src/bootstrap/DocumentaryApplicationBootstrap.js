"use strict";

const {
  DocumentaryCoreFactory
} = require("./DocumentaryCoreFactory");

const {
  MistralProvider
} = require("../providers/MistralProvider");

const {
  startApplication
} = require("../app");

function startDocumentaryApplication() {
  const cognitiveCore =
    new DocumentaryCoreFactory().build();

  const llmProvider =
    new MistralProvider();

  return startApplication({
    cognitiveCore,
    llmProvider
  });
}

module.exports = {
  startDocumentaryApplication
};
