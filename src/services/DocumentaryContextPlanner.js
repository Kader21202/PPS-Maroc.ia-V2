"use strict";

class DocumentaryContextPlanner {
  constructor({
    maxCharactersPerBatch
  } = {}) {
    if (
      !Number.isFinite(maxCharactersPerBatch) ||
      maxCharactersPerBatch <= 0
    ) {
      throw new Error(
        "DocumentaryContextPlanner requires a positive maxCharactersPerBatch."
      );
    }

    this.maxCharactersPerBatch =
      maxCharactersPerBatch;
  }

  plan(finalAnswer) {
    if (
      !finalAnswer ||
      typeof finalAnswer !== "object"
    ) {
      throw new Error(
        "DocumentaryContextPlanner.plan requires a FinalAnswer."
      );
    }

    const evidence =
      Array.isArray(
        finalAnswer.documentaryEvidence
      )
        ? finalAnswer.documentaryEvidence
        : [];

    if (evidence.length === 0) {
      return {
        mode: "direct",
        batches: [],
        evidenceCount: 0
      };
    }

    const batches = [];
    let currentEvidence = [];
    let currentCharacters = 0;

    for (const item of evidence) {
      const text =
        typeof item?.text === "string"
          ? item.text
          : "";

      const characters = text.length;

      if (
        characters >
        this.maxCharactersPerBatch
      ) {
        throw new Error(
          `Documentary evidence ${item.fragmentId || "unknown"} exceeds the configured batch budget.`
        );
      }

      if (
        currentEvidence.length > 0 &&
        currentCharacters + characters >
          this.maxCharactersPerBatch
      ) {
        batches.push({
          evidence: currentEvidence,
          characters: currentCharacters
        });

        currentEvidence = [];
        currentCharacters = 0;
      }

      currentEvidence.push(item);
      currentCharacters += characters;
    }

    if (currentEvidence.length > 0) {
      batches.push({
        evidence: currentEvidence,
        characters: currentCharacters
      });
    }

    return {
      mode:
        batches.length > 1
          ? "batched"
          : "direct",

      batches,

      evidenceCount: evidence.length,

      totalCharacters:
        evidence.reduce(
          (total, item) =>
            total +
            (
              typeof item?.text === "string"
                ? item.text.length
                : 0
            ),
          0
        )
    };
  }
}

module.exports = {
  DocumentaryContextPlanner
};
