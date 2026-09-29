"use strict";

const {
  CognitiveCoreFactory
} = require("./CognitiveCoreFactory");

const {
  GroqProvider
} = require("../providers/GroqProvider");

const {
  startApplication
} = require("../app");

function startLegacyApplication() {
  const cognitiveCore =
    new CognitiveCoreFactory().build();

  const llmProvider =
    new GroqProvider();

  return startApplication({
    cognitiveCore,
    llmProvider
  });
}

module.exports = {
  startLegacyApplication
};
