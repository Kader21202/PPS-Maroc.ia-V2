"use strict";

const http = require("http");

const {
  startApplication
} = require("./app");

const application =
  startApplication();

const platformService =
  application.platformService;

const PORT = 3001;

const server = http.createServer(
  async (req, res) => {

    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type"
    );

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    if (
      req.method === "POST" &&
      req.url === "/api/chat"
    ) {

      let body = "";

      req.on("data", chunk => {
        body += chunk;
      });

      req.on("end", async () => {

        try {

          const data =
            JSON.parse(body);

          const result =
            await platformService.ask(
              data.question
            );

          res.writeHead(200, {
            "Content-Type":
              "application/json"
          });

          res.end(
            JSON.stringify(
              result.finalAnswer
            )
          );

        } catch (error) {

          res.writeHead(500, {
            "Content-Type":
              "application/json"
          });

          res.end(
            JSON.stringify({
              error:
                error.message
            })
          );

        }

      });

      return;
    }

    res.writeHead(404);

    res.end();

  }
);

server.listen(
  PORT,
  () => {

    console.log(
      `PPS-Maroc.ia-V2 API listening on http://localhost:${PORT}`
    );

  }
);

