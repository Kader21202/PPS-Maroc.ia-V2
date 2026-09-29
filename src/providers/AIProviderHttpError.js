"use strict";

class AIProviderHttpError extends Error {
  constructor({
    provider,
    status,
    statusText,
    body = "",
    retryAfter = null
  } = {}) {
    if (
      typeof provider !== "string" ||
      !provider.trim()
    ) {
      throw new Error(
        "AIProviderHttpError requires a provider."
      );
    }

    if (
      typeof status !== "number" ||
      !Number.isFinite(status)
    ) {
      throw new Error(
        "AIProviderHttpError requires an HTTP status."
      );
    }

    const normalizedProvider =
      provider.trim();

    const normalizedStatusText =
      typeof statusText === "string"
        ? statusText
        : "";

    const normalizedBody =
      typeof body === "string"
        ? body
        : "";

    const providerLabel =
      normalizedProvider.charAt(0).toUpperCase() +
      normalizedProvider.slice(1);

    super(
      `${providerLabel} API error: ${status}` +
      (
        normalizedStatusText
          ? ` ${normalizedStatusText}`
          : ""
      ) +
      (
        normalizedBody
          ? ` - ${normalizedBody}`
          : ""
      )
    );

    this.name =
      "AIProviderHttpError";

    this.provider =
      normalizedProvider;

    this.status =
      status;

    this.statusText =
      normalizedStatusText;

    this.body =
      normalizedBody;

    this.retryAfter =
      retryAfter === null ||
      retryAfter === undefined
        ? null
        : String(retryAfter);
  }
}

module.exports = {
  AIProviderHttpError
};

