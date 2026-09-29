"use strict";

class DocumentaryBatchProcessor {
  constructor({ extractor } = {}) {
    if (
      !extractor ||
      typeof extractor.extract !== "function"
    ) {
      throw new Error(
        "DocumentaryBatchProcessor requires a valid documentary extractor."
      );
    }

    this.extractor = extractor;
  }

  async process({ question, plan } = {}) {
    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      throw new Error(
        "DocumentaryBatchProcessor requires a question."
      );
    }

    if (
      !plan ||
      typeof plan !== "object" ||
      !Array.isArray(plan.batches)
    ) {
      throw new Error(
        "DocumentaryBatchProcessor requires a valid documentary plan."
      );
    }

    const originalEvidence =
      plan.batches.flatMap(batch =>
        Array.isArray(batch.evidence)
          ? batch.evidence
          : []
      );

    const batchResults = [];

    for (const batch of plan.batches) {
      const result =
        await this.extractor.extract({
          question: question.trim(),
          evidence: Array.isArray(batch.evidence)
            ? batch.evidence
            : []
        });

      batchResults.push(result);
    }

    const facts =
      batchResults.flatMap(result =>
        Array.isArray(result.facts)
          ? result.facts
          : []
      );

    const coveredSet =
      new Set(
        batchResults.flatMap(result =>
          Array.isArray(result.coveredFragmentIds)
            ? result.coveredFragmentIds
            : []
        )
      );

    const coveredFragmentIds =
      originalEvidence
        .map(item => item.fragmentId)
        .filter(fragmentId =>
          coveredSet.has(fragmentId)
        );

    const uncoveredFragmentIds =
      originalEvidence
        .map(item => item.fragmentId)
        .filter(fragmentId =>
          !coveredSet.has(fragmentId)
        );

    return {
      question: question.trim(),
      originalEvidence,
      batchResults,
      facts,
      coveredFragmentIds,
      uncoveredFragmentIds,

      completeCoverage:
        uncoveredFragmentIds.length === 0,

      metadata: {
        batchCount: plan.batches.length,
        evidenceCount: originalEvidence.length,
        factCount: facts.length,
        coveredEvidenceCount:
          coveredFragmentIds.length,
        uncoveredEvidenceCount:
          uncoveredFragmentIds.length
      }
    };
  }
}

module.exports = {
  DocumentaryBatchProcessor
};
