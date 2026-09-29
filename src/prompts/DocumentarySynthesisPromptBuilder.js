"use strict";

class DocumentarySynthesisPromptBuilder {
  build(consolidation) {
    if (
      !consolidation ||
      typeof consolidation !== "object"
    ) {
      throw new Error(
        "DocumentarySynthesisPromptBuilder requires a valid consolidation."
      );
    }

    if (
      typeof consolidation.question !== "string" ||
      !consolidation.question.trim()
    ) {
      throw new Error(
        "DocumentarySynthesisPromptBuilder requires a question."
      );
    }

    if (!Array.isArray(consolidation.facts)) {
      throw new Error(
        "DocumentarySynthesisPromptBuilder requires consolidated facts."
      );
    }

    const facts =
      consolidation.facts.map(
        (fact, index) => {
          if (
            !fact ||
            typeof fact.text !== "string" ||
            !fact.text.trim() ||
            !Array.isArray(fact.fragmentIds) ||
            fact.fragmentIds.length === 0
          ) {
            throw new Error(
              "Each consolidated fact requires text and fragmentIds."
            );
          }

          return [
            `FACT ${index + 1}:`,
            `TEXT: ${fact.text.trim()}`,
            `FRAGMENT_IDS: ${fact.fragmentIds.join(", ")}`,
            `DOCUMENT_ID: ${fact.documentId || ""}`,
            `SECTION: ${fact.sectionTitle || ""}`
          ].join("\n");
        }
      );

    return {
      systemPrompt: [
        "You are a documentary answer synthesizer.",
        "Answer the user's question using only the consolidated facts supplied below.",
        "Do not add external knowledge.",
        "Do not invent information that is absent from the facts.",
        "Preserve factual distinctions between the supplied facts.",
        "Produce a clear, complete and coherent final answer."
      ].join("\n"),

      userPrompt: [
        `QUESTION: ${consolidation.question.trim()}`,
        "",
        "CONSOLIDATED FACTS:",
        facts.join("\n\n")
      ].join("\n"),

      metadata: {
        operation:
          "documentary-final-synthesis",

        factCount:
          consolidation.facts.length,

        evidenceCount:
          Array.isArray(
            consolidation.originalEvidence
          )
            ? consolidation.originalEvidence.length
            : 0,

        completeCoverage:
          consolidation.completeCoverage === true
      }
    };
  }
}

module.exports = {
  DocumentarySynthesisPromptBuilder
};
