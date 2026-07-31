"use strict";

class PlatformService {
  constructor({
    guardrails,
    chatService
  }) {
    if (!guardrails) {
      throw new Error(
        "PlatformService requires GuardrailsService."
      );
    }

    if (!chatService) {
      throw new Error(
        "PlatformService requires ChatService."
      );
    }

    this.guardrails = guardrails;
    this.chatService = chatService;
  }

  async askStream(question, onChunk) {
    if (typeof onChunk !== "function") {
      throw new Error(
        "PlatformService.askStream requires an onChunk callback."
      );
    }

    if (
      typeof this.chatService.askStream !==
      "function"
    ) {
      throw new Error(
        "ChatService does not support streaming."
      );
    }

    this.guardrails.validateInput(question);

    const response =
      await this.chatService.askStream(
        question,
        onChunk
      );

    this.guardrails.validateOutput(
      response.finalAnswer
    );

    return response;
  }
  async ask(question) {
    this.guardrails.validateInput(question);

    const response =
      await this.chatService.ask(question);

    this.guardrails.validateOutput(
      response.finalAnswer
    );

    return response;
  }
}

module.exports = {
  PlatformService
};
