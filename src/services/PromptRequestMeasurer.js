"use strict";

class PromptRequestMeasurer {
  measure(promptRequest) {
    if (
      !promptRequest ||
      typeof promptRequest !== "object" ||
      typeof promptRequest.systemPrompt !== "string" ||
      typeof promptRequest.userPrompt !== "string"
    ) {
      throw new Error(
        "PromptRequestMeasurer requires a valid PromptRequest."
      );
    }

    const systemCharacters =
      promptRequest.systemPrompt.length;

    const userCharacters =
      promptRequest.userPrompt.length;

    return {
      inputTokens: null,

      characters:
        systemCharacters +
        userCharacters,

      systemCharacters,
      userCharacters,

      measurementMethod:
        "characters",

      exact: false
    };
  }
}

module.exports = {
  PromptRequestMeasurer
};
