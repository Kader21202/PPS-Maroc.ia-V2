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
      answer = "",
      summary = "",
      reasoningSummary = "",
      confidence = null,
      documentaryEvidence = [],
      citations = [],
      metadata = {}
    } = finalAnswer;

    const normalizedQuestion =
      typeof question === "string"
        ? question.trim()
        : "";

    const normalizedAnswer =
      typeof answer === "string"
        ? answer.trim()
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

    /*
     * MODE 1 — Réponse cognitive déjà construite par le Core.
     *
     * Le LLM ne doit pas refaire le raisonnement ni rejuger
     * les preuves. Il doit uniquement exprimer proprement
     * la réponse produite par le moteur cognitif.
     */
    if (
      normalizedAnswer &&
      usableEvidence.length === 0
    ) {
      const userPrompt = `
Tu es le moteur d'expression de PPS-Maroc.ia.

Le moteur cognitif a déjà analysé la question, sélectionné les connaissances pertinentes et construit une réponse.

Ta mission est uniquement de produire une formulation finale claire et naturelle fidèle à cette réponse cognitive.

RÈGLES ABSOLUES :

1. Ne refais pas le raisonnement.
2. Ne rejette pas la réponse cognitive sous prétexte qu'aucune preuve documentaire brute n'est fournie.
3. N'ajoute aucune connaissance extérieure.
4. N'invente aucun fait, aucune date, aucune personne, aucun lieu ni aucune source.
5. Préserve toutes les informations importantes présentes dans la réponse cognitive.
6. Supprime uniquement les lourdeurs de formulation et répétitions évidentes.
7. Ne change pas le sens des affirmations.
8. Ne fusionne pas deux faits distincts en une seule affirmation si le moteur cognitif les a présentés séparément.
9. Ne crée aucune relation temporelle, causale, institutionnelle ou factuelle qui n'est pas explicitement établie dans la réponse cognitive.
10. Lorsque deux événements ont des dates, acteurs, lieux ou contextes distincts, conserve leur séparation.
11. Ne supprime pas les qualificatifs factuels présents dans la réponse cognitive, par exemple « annoncée », « estimée », « prévue », « provisoire », « selon le bilan » ou toute autre nuance qui limite ou précise une affirmation.
12. Ne transforme jamais une information annoncée, estimée, prévue ou rapportée en fait établi.
13. Ne remplace pas un concept par un autre, même proche sémantiquement. Conserve les termes factuels essentiels employés par le moteur cognitif : par exemple « couverture sociale » ne doit pas devenir « couverture médicale ».
14. Préserve les nombres, pourcentages, dates, quantificateurs, modalités, degrés de certitude et qualificatifs associés.
15. Tu peux améliorer la fluidité entre les phrases, mais sans transformer plusieurs faits en un fait composite ni modifier leur niveau de certitude.
16. Ne décris pas ta méthode de travail.
17. Ne dis jamais « Voici une reformulation ».
18. Si la réponse cognitive exprime explicitement une absence d'information, conserve cette absence d'information.

===== QUESTION UTILISATEUR =====

${normalizedQuestion || "Question non fournie."}

===== RÉPONSE PRODUITE PAR LE MOTEUR COGNITIF =====

${normalizedAnswer}

===== RÉSUMÉ COGNITIF =====

${typeof summary === "string" && summary.trim()
  ? summary.trim()
  : "Non fourni."}

===== RAISONNEMENT SYNTHÉTIQUE =====

${typeof reasoningSummary === "string" && reasoningSummary.trim()
  ? reasoningSummary.trim()
  : "Non fourni."}

===== CONFIANCE DU MOTEUR COGNITIF =====

${confidence ?? "Non fournie."}

===== CITATIONS DISPONIBLES =====

${JSON.stringify(citations, null, 2)}

===== STRATÉGIE COGNITIVE =====

${metadata.reasoningStrategy || "definition"}

===== INSTRUCTION FINALE =====

Exprime fidèlement la réponse cognitive pour l'utilisateur, sans ajouter de faits absents.
`.trim();

      return {
        systemPrompt:
          "Tu es le moteur d'expression de PPS-Maroc.ia. Le raisonnement a déjà été effectué par le moteur cognitif ; tu dois uniquement exprimer fidèlement son résultat.",
        userPrompt,
        metadata: {
          ...metadata,
          expressionMode: "cognitive"
        }
      };
    }

    /*
     * MODE 2 — Pipeline documentaire.
     *
     * Le LLM construit la réponse à partir des preuves
     * documentaires fournies.
     */
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
      metadata: {
        ...metadata,
        expressionMode: "documentary"
      }
    };
  }
}

module.exports = {
  ExpressionPromptBuilder
};
