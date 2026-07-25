"use strict";

const { AIProvider } = require("./AIProvider");

class MistralProvider extends AIProvider {
  constructor({
    apiKey = process.env.MISTRAL_API_KEY,
    model = "mistral-small-latest",
    temperature = 0.2
  } = {}) {
    super();

    if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
      throw new Error("MistralProvider requires MISTRAL_API_KEY.");
    }

    this.apiKey = apiKey;
    this.model = model;
    this.temperature = temperature;
    this.endpoint = "https://api.mistral.ai/v1/chat/completions";
  }

  async invoke(promptRequest) {
    if (!promptRequest || typeof promptRequest !== "object") {
      throw new Error("Prompt request must be an object.");
    }

    const {
      systemPrompt,
      userPrompt,
      metadata = {}
    } = promptRequest;

    if (
      typeof systemPrompt !== "string" ||
      systemPrompt.trim().length === 0
    ) {
      throw new Error("System prompt cannot be empty.");
    }

    if (
      typeof userPrompt !== "string" ||
      userPrompt.trim().length === 0
    ) {
      throw new Error("User prompt cannot be empty.");
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: this.temperature
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Mistral API error: ${response.status} ${response.statusText}` +
        (errorBody ? ` - ${errorBody}` : "")
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("Mistral API returned an empty response.");
    }

    return {
      provider: "mistral",
      model: this.model,
      content: content.trim(),
      metadata
    };
  }
}

module.exports = {
  MistralProvider
};