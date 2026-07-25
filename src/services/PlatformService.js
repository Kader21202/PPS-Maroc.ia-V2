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