"use strict";

const {
  CognitiveCoreFactory
} = require("./CognitiveCoreFactory");

const {
  MistralProvider
} = require("../providers/MistralProvider");

const {
  startApplication
} = require("../app");

function startLegacyApplication() {
  const cognitiveCore =
    new CognitiveCoreFactory().build();

  const llmProvider =
    new MistralProvider();

  return startApplication({
    cognitiveCore,
    llmProvider
  });
}

module.exports = {
  startLegacyApplication
};
