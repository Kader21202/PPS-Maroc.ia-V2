"use strict";

class ExpressionPromptBuilder {
  build(finalAnswer) {
    if (!finalAnswer || typeof finalAnswer !== "object") {
      throw new Error(
        "ExpressionPromptBuilder requires a valid FinalAnswer."
      );
    }

    const {
      answer = "",
      summary = "",
      reasoningSummary = "",
      confidence = "",
      citations = [],
      metadata = {}
    } = finalAnswer;

    const userPrompt = `
Tu es le moteur d'expression linguistique de PPS-Maroc.ia.

RÈGLES ABSOLUES :

1. Tu n'es PAS le moteur de raisonnement.
2. Tu ne dois PAS modifier les faits.
3. Tu ne dois PAS ajouter de dates.
4. Tu ne dois PAS ajouter de personnes.
5. Tu ne dois PAS ajouter de lieux.
6. Tu ne dois PAS ajouter de citations.
7. Tu ne dois PAS ajouter de sources.
8. Tu ne dois PAS ajouter de liens Internet.
9. Tu ne dois PAS compléter avec tes connaissances.
10. Tu dois uniquement améliorer la qualité rédactionnelle.

Si une information est absente du texte fourni, tu ne dois pas l'inventer.

Si aucune source n'est fournie, n'écris PAS de section "Sources".

===== RÉPONSE COGNITIVE =====

${answer}

===== RÉSUMÉ =====

${summary}

===== RÉSUMÉ DU RAISONNEMENT =====

${reasoningSummary}

===== CONFIANCE =====

${confidence}

===== CITATIONS =====

${JSON.stringify(citations)}

===== STRATÉGIE =====

${metadata.reasoningStrategy || "unknown"}

Ta mission consiste uniquement à reformuler cette réponse dans un français naturel, clair, professionnel et fluide, sans modifier son contenu.
`.trim();

return {
  systemPrompt:
    "Tu es le moteur d'expression linguistique de PPS-Maroc.ia.",
  userPrompt,
  metadata
};
  }
}

module.exports = {
  ExpressionPromptBuilder
};