"use strict";

const {
  DocumentaryCoreFactory
} = require("./DocumentaryCoreFactory");

const {
  GroqProvider
} = require("../providers/GroqProvider");
const {
  startApplication
} = require("../app");

function startDocumentaryApplication() {
  const cognitiveCore =
    new DocumentaryCoreFactory().build();

  const llmProvider =
  new GroqProvider();

  return startApplication({
    cognitiveCore,
    llmProvider
  });
}

module.exports = {
  startDocumentaryApplication
};
