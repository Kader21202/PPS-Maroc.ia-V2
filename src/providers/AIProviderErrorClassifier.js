"use strict";

class AIProviderErrorClassifier {
  classify(error) {
    if (
      !error ||
      typeof error !== "object"
    ) {
      throw new Error(
        "AIProviderErrorClassifier requires a valid provider error."
      );
    }

    const status =
      error.status;

    if (
      typeof status !== "number" ||
      !Number.isFinite(status)
    ) {
      throw new Error(
        "AIProviderErrorClassifier requires an HTTP status."
      );
    }

    const body =
      typeof error.body === "string"
        ? error.body
        : "";

    const normalizedBody =
      body.toLowerCase();

    const retryAfter =
      error.retryAfter === undefined
        ? null
        : error.retryAfter;

    /*
     * Rate-limit dimensions are inferred only from
     * explicit provider error semantics.
     *
     * HTTP status alone does not determine whether
     * a limit concerns TPM, RPM or another quota.
     */
    const tokensPerMinute =
      normalizedBody.includes(
        "tokens per minute"
      ) ||
      /\btpm\b/i.test(body);

    const requestsPerMinute =
      normalizedBody.includes(
        "requests per minute"
      ) ||
      /\brpm\b/i.test(body);

    if (
      status === 429 ||
      (
        status === 413 &&
        (
          tokensPerMinute ||
          requestsPerMinute
        )
      )
    ) {
      let dimension = null;

      if (tokensPerMinute) {
        dimension =
          "TOKENS_PER_MINUTE";
      } else if (requestsPerMinute) {
        dimension =
          "REQUESTS_PER_MINUTE";
      }

      return {
        category: "RATE_LIMIT",
        dimension,
        status,
        provider:
          error.provider || null,
        retryAfter
      };
    }

    if (status === 413) {
      return {
        category:
          "REQUEST_TOO_LARGE",
        dimension: null,
        status,
        provider:
          error.provider || null,
        retryAfter
      };
    }

    if (
      status === 401 ||
      status === 403
    ) {
      return {
        category:
          "AUTHENTICATION",
        dimension: null,
        status,
        provider:
          error.provider || null,
        retryAfter
      };
    }

    if (
      status >= 500 &&
      status <= 599
    ) {
      return {
        category:
          "SERVER_ERROR",
        dimension: null,
        status,
        provider:
          error.provider || null,
        retryAfter
      };
    }

    return {
      category:
        "OTHER_HTTP_ERROR",
      dimension: null,
      status,
      provider:
        error.provider || null,
      retryAfter
    };
  }
}

module.exports = {
  AIProviderErrorClassifier
};
