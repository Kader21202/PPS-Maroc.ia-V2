"use strict";

const assert = require("assert");
const http = require("http");

const {
  createServer
} = require("../src/server");

class FakePlatformService {
  async ask() {
    throw new Error(
      "ask() must not be called during streaming."
    );
  }

  async askStream(question, onChunk) {
    assert.strictEqual(
      question,
      "Qui est Ali Yata ?"
    );

    onChunk("Réponse publique ");
    onChunk("en streaming.");

    return {
      question,
      answer: {
        provider: "fake",
        model: "fake-model",
        content:
          "Réponse publique en streaming.",
        metadata: {
          reasoningStrategy: "biography"
        }
      },
      finalAnswer: {
        answer:
          "Réponse cognitive brute qui ne doit pas être envoyée.",
        confidence: 0.91
      },
      verificationReport: {
        valid: true
      }
    };
  }
}

function sendRequest(port) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      question: "Qui est Ali Yata ?"
    });

    const request = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: "/api/chat/stream",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length":
            Buffer.byteLength(payload)
        }
      },
      (response) => {
        let body = "";

        response.setEncoding("utf8");

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          resolve({
            statusCode:
              response.statusCode,
            headers:
              response.headers,
            body
          });
        });
      }
    );

    request.on("error", reject);
    request.end(payload);
  });
}

(async () => {
  const application = {
    name: "PPS-Maroc.ia-V2",
    status: "ready",
    fragmentsCount: 100,
    platformService:
      new FakePlatformService()
  };

  const server =
    createServer(application);

  await new Promise((resolve) => {
    server.listen(
      0,
      "127.0.0.1",
      resolve
    );
  });

  try {
    const address =
      server.address();

    const response =
      await sendRequest(address.port);

    assert.strictEqual(
      response.statusCode,
      200
    );

    assert.match(
      response.headers["content-type"],
      /^application\/x-ndjson/
    );

    const events =
      response.body
        .trim()
        .split("\n")
        .map(line => JSON.parse(line));

    assert.deepStrictEqual(
      events,
      [
        {
          type: "chunk",
          content:
            "Réponse publique "
        },
        {
          type: "chunk",
          content:
            "en streaming."
        },
        {
          type: "complete",
          question:
            "Qui est Ali Yata ?",
          answer:
            "Réponse publique en streaming.",
          sources: [],
          metadata: {
            provider: "fake",
            model: "fake-model",
            verification: {
              valid: true
            },
            expression: {
              reasoningStrategy:
                "biography"
            }
          }
        }
      ]
    );

    assert.notStrictEqual(
      events[2].answer,
      "Réponse cognitive brute qui ne doit pas être envoyée."
    );

    console.log(
      "✅ Contrat HTTP /api/chat/stream validé"
    );
  } finally {
    await new Promise(
      (resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }
    );
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
