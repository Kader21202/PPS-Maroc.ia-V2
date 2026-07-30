"use strict";

class ExpressionPromptBuilder {
  build(finalAnswer) {
    if (
      !finalAnswer ||
      typeof finalAnswer !== "object"
    ) {
      throw new Error(
        "ExpressionPromptBuilder requires a valid FinalAnswer."
      );
    }

    const {
      question = "",
      documentaryEvidence = [],
      citations = [],
      metadata = {}
    } = finalAnswer;

    const normalizedQuestion =
      typeof question === "string"
        ? question.trim()
        : "";

    const usableEvidence =
      Array.isArray(documentaryEvidence)
        ? documentaryEvidence.filter(
            evidence =>
              evidence &&
              typeof evidence.text === "string" &&
              evidence.text.trim()
          )
        : [];

    const evidenceText =
      usableEvidence.length > 0
        ? usableEvidence
            .map((evidence, index) => {
              const documentId =
                evidence.documentId ||
                "document inconnu";

              const sectionTitle =
                typeof evidence.sectionTitle ===
                  "string" &&
                evidence.sectionTitle.trim()
                  ? evidence.sectionTitle.trim()
                  : "section sans titre";

              const text =
                evidence.text.trim();

              return [
                `===== FRAGMENT ${index + 1} =====`,
                `DOCUMENT : ${documentId}`,
                `SECTION : ${sectionTitle}`,
                "",
                text
              ].join("\n");
            })
            .join("\n\n")
        : "Aucune preuve documentaire disponible.";

    const userPrompt = `
Tu es le moteur de réponse documentaire de PPS-Maroc.ia.

Ta mission est de répondre directement à la question de l'utilisateur en utilisant uniquement les preuves documentaires fournies.

RÈGLES ABSOLUES :

1. Réponds uniquement à la question posée.
2. Utilise uniquement les preuves documentaires fournies.
3. N'utilise aucune connaissance extérieure.
4. N'invente aucun fait, aucune date, aucune personne, aucun lieu ni aucune source.
5. Ignore les fragments qui ne répondent pas directement à la question.
6. Ne concatène pas mécaniquement tous les fragments.
7. Regroupe les informations complémentaires.
8. Supprime les répétitions.
9. Ne mélange pas les informations concernant des personnes, événements ou organisations différents.
10. Ne présente pas les rubriques techniques comme MOTS-CLÉS, QUESTIONS, PERSONNALITÉS, ORGANISATIONS, LIEUX ou SOURCES, sauf si leur contenu répond directement à la question.
11. Ne dis jamais « Voici une reformulation ».
12. Ne décris pas ta méthode de travail.
13. Si les preuves sont insuffisantes, indique clairement que les documents disponibles ne permettent pas de répondre complètement.
14. Rédige une réponse claire, cohérente, structurée et fidèle aux documents.
15. Ne crée pas de section « Sources » à partir de ta propre connaissance.

===== QUESTION UTILISATEUR =====

${normalizedQuestion || "Question non fournie."}

===== PREUVES DOCUMENTAIRES =====

${evidenceText}

===== CITATIONS DISPONIBLES =====

${JSON.stringify(citations, null, 2)}

===== STRATÉGIE DOCUMENTAIRE =====

${metadata.retrievalStrategy || metadata.reasoningStrategy || "semantic"}

===== INSTRUCTION FINALE =====

Construis maintenant la réponse qui répond précisément à la question utilisateur.

Sélectionne uniquement les fragments pertinents. N'ajoute aucune information absente des preuves documentaires.
`.trim();

    return {
      systemPrompt:
        "Tu es le moteur de réponse documentaire de PPS-Maroc.ia. Tu réponds uniquement à partir des preuves documentaires fournies.",
      userPrompt,
      metadata
    };
  }
}

module.exports = {
  ExpressionPromptBuilder
};