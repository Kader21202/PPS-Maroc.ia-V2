"use strict";

class DocumentaryEvidenceExtractor {
  constructor({
    provider,
    requestExecutor = null
  } = {}) {
    if (
      !provider ||
      typeof provider.invoke !== "function"
    ) {
      throw new Error(
        "DocumentaryEvidenceExtractor requires a valid AIProvider."
      );
    }

    if (
      requestExecutor !== null &&
      (
        typeof requestExecutor !== "object" ||
        typeof requestExecutor.execute !== "function"
      )
    ) {
      throw new Error(
        "DocumentaryEvidenceExtractor requires a valid request executor."
      );
    }

    this.provider = provider;
    this.requestExecutor =
      requestExecutor;
  }

  async extract({
    question,
    evidence
  } = {}) {
    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      throw new Error(
        "DocumentaryEvidenceExtractor requires a question."
      );
    }

    if (!Array.isArray(evidence)) {
      throw new Error(
        "DocumentaryEvidenceExtractor requires documentary evidence."
      );
    }

    const evidenceById = new Map();

    for (const item of evidence) {
      if (
        !item ||
        typeof item.fragmentId !== "string" ||
        !item.fragmentId.trim()
      ) {
        throw new Error(
          "Each documentary evidence item requires a fragmentId."
        );
      }

      evidenceById.set(
        item.fragmentId,
        item
      );
    }

    const documentaryText =
      evidence
        .map(item => {
          return [
            `FRAGMENT_ID: ${item.fragmentId}`,
            `DOCUMENT_ID: ${item.documentId || ""}`,
            `SECTION: ${item.sectionTitle || ""}`,
            "TEXT:",
            typeof item.text === "string"
              ? item.text
              : ""
          ].join("\n");
        })
        .join("\n\n");

    const promptRequest = {
      systemPrompt: [
        "You are a documentary evidence extractor.",
        "Extract only factual information supported by the supplied fragments.",
        "Do not add external knowledge.",
        "Every extracted fact must cite one or more supplied FRAGMENT_ID values.",
        "Return valid JSON only.",
        'Required format: {"facts":[{"text":"...","fragmentIds":["..."]}]}'
      ].join("\n"),

      userPrompt: [
        `QUESTION: ${question.trim()}`,
        "",
        documentaryText
      ].join("\n"),

      metadata: {
        operation:
          "documentary-evidence-extraction",
        evidenceCount: evidence.length
      }
    };

    const response =
      this.requestExecutor
        ? await this.requestExecutor.execute({
            promptRequest,

            finalAnswer: {
              question:
                question.trim()
            },

            provider:
              this.provider
          })
        : await this.provider.invoke(
            promptRequest
          );

    if (
      !response ||
      typeof response.content !== "string"
    ) {
      throw new Error(
        "Documentary evidence extraction returned no content."
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(
        response.content.trim()
      );
    } catch {
      throw new Error(
        "Documentary evidence extraction returned invalid JSON."
      );
    }

    if (!Array.isArray(parsed.facts)) {
      throw new Error(
        "Documentary evidence extraction must return a facts array."
      );
    }

    const facts =
      parsed.facts.map(fact => {
        if (
          !fact ||
          typeof fact.text !== "string" ||
          !Array.isArray(fact.fragmentIds) ||
          fact.fragmentIds.length === 0
        ) {
          throw new Error(
            "Each extracted fact requires text and fragmentIds."
          );
        }

        const originalEvidence =
          fact.fragmentIds.map(
            fragmentId => {
              const source =
                evidenceById.get(
                  fragmentId
                );

              if (!source) {
                throw new Error(
                  `Extracted fact references unknown fragmentId: ${fragmentId}`
                );
              }

              return source;
            }
          );

        const primary =
          originalEvidence[0];

        const sources = [];

        for (const sourceEvidence of originalEvidence) {
          if (
            Array.isArray(
              sourceEvidence.sources
            )
          ) {
            for (
              const source
              of sourceEvidence.sources
            ) {
              sources.push(source);
            }
          }
        }

        return {
          text: fact.text.trim(),
          fragmentIds:
            [...fact.fragmentIds],

          documentId:
            primary.documentId || null,

          sectionTitle:
            primary.sectionTitle || null,

          sources
        };
      });

    const coveredFragmentIdSet =
      new Set();

    for (const fact of facts) {
      for (const fragmentId of fact.fragmentIds) {
        coveredFragmentIdSet.add(fragmentId);
      }
    }

    const coveredFragmentIds =
      evidence
        .map(item => item.fragmentId)
        .filter(
          fragmentId =>
            coveredFragmentIdSet.has(fragmentId)
        );

    const uncoveredFragmentIds =
      evidence
        .map(item => item.fragmentId)
        .filter(
          fragmentId =>
            !coveredFragmentIdSet.has(fragmentId)
        );

    return {
      question: question.trim(),

      facts,

      coveredFragmentIds,

      uncoveredFragmentIds,

      completeCoverage:
        uncoveredFragmentIds.length === 0,

      metadata: {
        operation:
          "documentary-evidence-extraction",

        evidenceCount:
          evidence.length,

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
  DocumentaryEvidenceExtractor
};
