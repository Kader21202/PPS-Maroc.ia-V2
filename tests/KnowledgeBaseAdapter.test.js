const assert = require("assert");

const {
  KnowledgeBaseAdapter
} = require(
  "../src/adapters/KnowledgeBaseAdapter"
);

class FakeKnowledgePackageBuilder {

  build(question, options = {}) {

    return {
      question,
      options,
      fragments: [
        {
          id: "fragment-1"
        }
      ]
    };

  }

}

const adapter =
  new KnowledgeBaseAdapter({
    knowledgePackageBuilder:
      new FakeKnowledgePackageBuilder()
  });

const result =
  adapter.build(
    "Qui est Ali Yata ?",
    {
      limit: 10
    }
  );

assert.strictEqual(
  result.question,
  "Qui est Ali Yata ?"
);

assert.strictEqual(
  result.options.limit,
  10
);

assert.strictEqual(
  result.fragments.length,
  1
);

assert.strictEqual(
  result.fragments[0].id,
  "fragment-1"
);

assert.throws(
  () => {
    new KnowledgeBaseAdapter({});
  },
  /KnowledgeBaseAdapter requires KnowledgePackageBuilder/
);

console.log(
  "✅ KnowledgeBaseAdapter validé"
);