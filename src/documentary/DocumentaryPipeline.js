"use strict";

class DocumentaryPipeline {
  prepare(context) {
    if (!context || typeof context !== "object") {
      throw new Error(
        "DocumentaryPipeline.prepare requires a context."
      );
    }

    return context;
  }

  generateClarification(context) {
    if (!context || typeof context !== "object") {
      throw new Error(
        "DocumentaryPipeline.generateClarification requires a context."
      );
    }

    return {
      answer:
        "La question nécessite une clarification.",
      summary: "",
      reasoningSummary:
        "Aucune recherche documentaire n'a été exécutée.",
      confidence: "low",
      citations: [],
      metadata: {
        reasoningStrategy: "clarification"
      }
    };
  }

  complete(context) {
    if (!context || typeof context !== "object") {
      throw new Error(
        "DocumentaryPipeline.complete requires a context."
      );
    }

    const knowledgePackage =
      context.knowledgePackage;

    if (
      !knowledgePackage ||
      !Array.isArray(knowledgePackage.fragments)
    ) {
      throw new Error(
        "DocumentaryPipeline.complete requires a KnowledgePackage."
      );
    }

    const usableFragments =
      knowledgePackage.fragments.filter(
        fragment =>
          fragment &&
          typeof fragment.text === "string" &&
          fragment.text.trim()
      );

    const question =
  typeof context.question === "string"
    ? context.question.trim()
    : "";

const documentaryEvidence =
  usableFragments.map((fragment, index) => ({
    index: index + 1,
    fragmentId: fragment.id || null,
    documentId: fragment.documentId || null,
    sectionTitle:
      typeof fragment.sectionTitle === "string"
        ? fragment.sectionTitle.trim()
        : "",
    text: fragment.text.trim(),
    sources: Array.isArray(fragment.sources)
      ? fragment.sources
      : []
  }));

const answer =
  usableFragments.length > 0
    ? ""
    : "Aucune information documentaire pertinente n'a été trouvée.";
    const citations = usableFragments.map(
      fragment => ({
        fragmentId: fragment.id || null,
        documentId: fragment.documentId || null,
        sectionTitle:
          fragment.sectionTitle || null,
        sources: Array.isArray(fragment.sources)
          ? fragment.sources
          : []
      })
    );

   return {
  question,
  answer,
  documentaryEvidence,
  summary: "",
      reasoningSummary:
  "Preuves documentaires préparées pour la construction de la réponse.",
      confidence:
        usableFragments.length > 0
          ? "documentary"
          : "low",
      citations,
      metadata: {
        reasoningStrategy: "documentary",
        fragmentsCount: usableFragments.length,
        retrievalStrategy:
          knowledgePackage.metadata?.strategy ||
          context.plan?.retrievalStrategy ||
          "semantic"
      }
    };
  }
}

module.exports = {
  DocumentaryPipeline
};
