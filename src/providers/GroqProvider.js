"use strict";

const { AIProvider } = require("./AIProvider");

const {
  AIProviderHttpError
} = require("./AIProviderHttpError");

class GroqProvider extends AIProvider {
  constructor({
    apiKey = process.env.GROQ_API_KEY,
    model = "openai/gpt-oss-20b",
    temperature = 0.2
  } = {}) {
    super();

    if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
      throw new Error("GroqProvider requires GROQ_API_KEY.");
    }

    this.apiKey = apiKey.trim();
    this.model = model;
    this.temperature = temperature;
    this.endpoint =
      "https://api.groq.com/openai/v1/chat/completions";
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
      const errorBody =
        await response.text();

      const retryAfter =
        response.headers &&
        typeof response.headers.get === "function"
          ? response.headers.get(
              "retry-after"
            )
          : null;

      throw new AIProviderHttpError({
        provider: "groq",
        status: response.status,
        statusText:
          response.statusText,
        body: errorBody,
        retryAfter
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      throw new Error("Groq API returned an empty response.");
    }

    return {
      provider: "groq",
      model: this.model,
      content: content.trim(),
      metadata
    };
  }
}

module.exports = {
  GroqProvider
};

