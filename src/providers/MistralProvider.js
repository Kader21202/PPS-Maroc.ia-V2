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

  getCapabilities() {
    const capabilities =
      super.getCapabilities();

    return {
      ...capabilities,
      streaming: true
    };
  }

  async stream(promptRequest, onChunk) {
    if (!promptRequest || typeof promptRequest !== "object") {
      throw new Error("Prompt request must be an object.");
    }

    if (typeof onChunk !== "function") {
      throw new Error(
        "MistralProvider.stream requires an onChunk callback."
      );
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
        "Content-Type": "application/json",
        Accept: "text/event-stream"
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
        temperature: this.temperature,
        stream: true
      })
    });

    if (!response.ok) {
      const errorBody =
        typeof response.text === "function"
          ? await response.text()
          : "";

      throw new Error(
        `Mistral API error: ${response.status} ${response.statusText}` +
        (errorBody ? ` - ${errorBody}` : "")
      );
    }

    if (
      !response.body ||
      typeof response.body.getReader !== "function"
    ) {
      throw new Error(
        "Mistral API returned no readable stream."
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let completeContent = "";
    let streamFinished = false;

    const processEvent = (eventBlock) => {
      const lines = eventBlock.split(/\r?\n/);

      for (const line of lines) {
        if (!line.startsWith("data:")) {
          continue;
        }

        const data = line.slice(5).trim();

        if (!data) {
          continue;
        }

        if (data === "[DONE]") {
          streamFinished = true;
          return;
        }

        let payload;

        try {
          payload = JSON.parse(data);
        } catch {
          throw new Error(
            `Invalid Mistral streaming event: ${data}`
          );
        }

        const content =
          payload?.choices?.[0]?.delta?.content;

        if (
          typeof content === "string" &&
          content.length > 0
        ) {
          completeContent += content;
          onChunk(content);
        }
      }
    };

    while (!streamFinished) {
      const {
        value,
        done
      } = await reader.read();

      if (done) {
        buffer += decoder.decode();
        break;
      }

      buffer += decoder.decode(
        value,
        {
          stream: true
        }
      );

      const eventBlocks = buffer.split(/\r?\n\r?\n/);
      buffer = eventBlocks.pop() ?? "";

      for (const eventBlock of eventBlocks) {
        processEvent(eventBlock);

        if (streamFinished) {
          break;
        }
      }
    }

    if (!streamFinished && buffer.trim().length > 0) {
      processEvent(buffer);
    }

    if (completeContent.trim().length === 0) {
      throw new Error(
        "Mistral API returned an empty streamed response."
      );
    }

    return {
      provider: "mistral",
      model: this.model,
      content: completeContent,
      metadata
    };
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
