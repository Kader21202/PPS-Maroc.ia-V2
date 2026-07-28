const assert = require("assert");

const {
  CognitiveAIAdapter
} = require(
  "../src/adapters/CognitiveAIAdapter"
);

class FakePipeline {
  prepare(context) {
    context.prepared = true;
  }

  complete(context) {
    return {
      finalAnswer: "OK",
      context
    };
  }

  generateClarification(context) {
    return {
      finalAnswer:
        "Pouvez-vous préciser votre demande ?",
      context
    };
  }
}

class FakeContextBuilder {
  build({
    question
  }) {
    return {
      question
    };
  }
}

const adapter =
  new CognitiveAIAdapter({
    cognitivePipeline:
      new FakePipeline(),
    cognitiveContextBuilder:
      new FakeContextBuilder()
  });

const context =
  adapter.prepare({
    question: "Bonjour"
  });

assert.strictEqual(
  context.prepared,
  true
);

const answer =
  adapter.complete(
    context,
    {}
  );

assert.strictEqual(
  answer.finalAnswer,
  "OK"
);

const clarificationAnswer =
  adapter.generateClarification(
    context
  );

assert.strictEqual(
  clarificationAnswer.finalAnswer,
  "Pouvez-vous préciser votre demande ?"
);

assert.strictEqual(
  clarificationAnswer.context,
  context
);

console.log(
  "✅ CognitiveAIAdapter validé"
);
