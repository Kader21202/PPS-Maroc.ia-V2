"use strict";

const http = require("http");

const {
  startDocumentaryApplication
} = require(
  "./bootstrap/DocumentaryApplicationBootstrap"
);

const PORT = Number(
  process.env.PPS_MAROC_API_PORT || 3001
);

const HOST = process.env.PPS_MAROC_API_HOST ||
  "127.0.0.1";

const MAX_BODY_SIZE = 1024 * 1024;

function setCorsHeaders(response) {
  response.setHeader(
    "Access-Control-Allow-Origin",
    "http://localhost:5173"
  );

  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
}

function sendJson(response, statusCode, payload) {
  setCorsHeaders(response);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });

  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let receivedSize = 0;

    request.on("data", (chunk) => {
      receivedSize += chunk.length;

      if (receivedSize > MAX_BODY_SIZE) {
        reject(
          new Error("Request body is too large.")
        );

        request.destroy();
        return;
      }

      body += chunk.toString("utf8");
    });

    request.on("end", () => {
      if (!body.trim()) {
        reject(
          new Error("Request body cannot be empty.")
        );

        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(
          new Error("Request body must contain valid JSON.")
        );
      }
    });

    request.on("error", reject);
  });
}

function extractPublicAnswer(result) {
  const answer = result?.answer;

  if (
    typeof answer === "string" &&
    answer.trim().length > 0
  ) {
    return {
      content: answer.trim(),
      provider: null,
      model: null,
      metadata: {}
    };
  }

  if (
    answer &&
    typeof answer === "object" &&
    typeof answer.content === "string" &&
    answer.content.trim().length > 0
  ) {
    return {
      content: answer.content.trim(),
      provider:
        typeof answer.provider === "string"
          ? answer.provider
          : null,
      model:
        typeof answer.model === "string"
          ? answer.model
          : null,
      metadata:
        answer.metadata &&
        typeof answer.metadata === "object"
          ? answer.metadata
          : {}
    };
  }

  throw new Error(
    "PlatformService returned no public answer."
  );
}

function createServer(application) {
  return http.createServer(
    async (request, response) => {
      setCorsHeaders(response);

      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      const requestUrl = new URL(
        request.url,
        `http://${request.headers.host || `${HOST}:${PORT}`}`
      );

      if (
        request.method === "GET" &&
        requestUrl.pathname === "/api/status"
      ) {
        sendJson(response, 200, {
          name: application.name,
          status: application.status,
          fragmentsCount:
            application.fragmentsCount
        });

        return;
      }

      if (
        request.method === "POST" &&
        requestUrl.pathname === "/api/chat"
      ) {
        try {
          const body = await readJsonBody(request);

          const question = body?.question;

          if (
            typeof question !== "string" ||
            question.trim().length === 0
          ) {
            sendJson(response, 400, {
              error: {
                code: "INVALID_QUESTION",
                message:
                  "The question must be a non-empty string."
              }
            });

            return;
          }

          const result =
            await application.platformService.ask(
              question.trim()
            );

          const publicAnswer =
            extractPublicAnswer(result);

          sendJson(response, 200, {
            question: result.question,
            answer: publicAnswer.content,
            sources: [],
            metadata: {
              provider: publicAnswer.provider,
              model: publicAnswer.model,
              verification:
                result.verificationReport ?? null,
              expression:
                publicAnswer.metadata
            }
          });
        } catch (error) {
          console.error(
            "POST /api/chat failed:",
            error
          );

          sendJson(response, 500, {
            error: {
              code: "CHAT_PROCESSING_FAILED",
              message:
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred."
            }
          });
        }

        return;
      }

      sendJson(response, 404, {
        error: {
          code: "ROUTE_NOT_FOUND",
          message: "Route not found."
        }
      });
    }
  );
}

function startServer() {
  const application =
    startDocumentaryApplication();
  const server = createServer(application);

  server.listen(PORT, HOST, () => {
    console.log({
      name: application.name,
      status: "listening",
      address: `http://${HOST}:${PORT}`,
      fragmentsCount:
        application.fragmentsCount
    });
  });

  return {
    application,
    server
  };
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createServer,
  startServer
};




