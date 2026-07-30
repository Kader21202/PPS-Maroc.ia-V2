"use strict";

const assert = require("assert");

const {
  CognitiveCoreFactory
} = require(
  "../src/bootstrap/CognitiveCoreFactory"
);

const factory =
  new CognitiveCoreFactory();

const cognitiveCore =
  factory.build();

assert.ok(
  cognitiveCore,
  "La factory doit retourner un moteur cognitif."
);

assert.ok(
  cognitiveCore.cognitivePipeline,
  "Le moteur doit exposer cognitivePipeline."
);

assert.ok(
  cognitiveCore.cognitiveContextBuilder,
  "Le moteur doit exposer cognitiveContextBuilder."
);

console.log(
  "✅ CognitiveCoreFactory validée"
);
