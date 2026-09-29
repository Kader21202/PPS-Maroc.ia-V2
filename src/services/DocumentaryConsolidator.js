"use strict";

class DocumentaryConsolidator {
  consolidate(processorResult) {
    if (
      !processorResult ||
      typeof processorResult !== "object"
    ) {
      throw new Error(
        "DocumentaryConsolidator requires a processor result."
      );
    }

    const originalEvidence =
      Array.isArray(
        processorResult.originalEvidence
      )
        ? processorResult.originalEvidence
        : [];

    const facts =
      Array.isArray(processorResult.facts)
        ? processorResult.facts
        : [];

    const coveredFragmentIds =
      Array.isArray(
        processorResult.coveredFragmentIds
      )
        ? processorResult.coveredFragmentIds
        : [];

    const uncoveredFragmentIds =
      Array.isArray(
        processorResult.uncoveredFragmentIds
      )
        ? processorResult.uncoveredFragmentIds
        : [];

    return {
      question:
        typeof processorResult.question === "string"
          ? processorResult.question
          : "",

      originalEvidence,

      facts,

      coveredFragmentIds,

      uncoveredFragmentIds,

      completeCoverage:
        processorResult.completeCoverage === true,

      metadata: {
        operation:
          "documentary-consolidation",

        evidenceCount:
          originalEvidence.length,

        factCount:
          facts.length,

        coveredEvidenceCount:
          coveredFragmentIds.length,

        uncoveredEvidenceCount:
          uncoveredFragmentIds.length
      }
    };
  }
}

module.exports = {
  DocumentaryConsolidator
};
