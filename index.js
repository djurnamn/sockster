#!/usr/bin/env node
"use strict";

const { createServer } = require("http");
const { Server } = require("socket.io");

const DEFAULTS = {
  port: 4000,
  origins: ["http://localhost:3000"],
  echo: true,
};

function parseOrigins(value) {
  if (!value) return DEFAULTS.origins;
  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (origins.includes("*")) return "*";
  return origins.length > 0 ? origins : DEFAULTS.origins;
}

function createSockster(options = {}) {
  const origins = options.origins ?? DEFAULTS.origins;
  const echo = options.echo ?? DEFAULTS.echo;

  const httpServer = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          uptime: process.uptime(),
          connections: io.engine.clientsCount,
        })
      );
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  const io = new Server(httpServer, {
    cors: {
      origin: origins,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log(`Client connected [id=${socket.id}]`);

    socket.onAny((eventName, ...args) => {
      console.log(`Event received [${eventName}]`);
      if (echo) {
        io.emit(eventName, ...args);
      } else {
        socket.broadcast.emit(eventName, ...args);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected [id=${socket.id}] due to ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error [id=${socket.id}]:`, error);
    });
  });

  httpServer.on("error", (error) => {
    console.error("Server error:", error);
  });

  return { httpServer, io };
}

if (require.main === module) {
  require("dotenv").config({ quiet: true });

  const port = Number(process.env.SOCKSTER_PORT) || DEFAULTS.port;
  const origins = parseOrigins(process.env.SOCKSTER_ORIGIN_URL);
  const echo = process.env.SOCKSTER_ECHO !== "false";

  const { httpServer, io } = createSockster({ origins, echo });

  httpServer.listen(port, () => {
    console.log(`sockster listening on port ${port}`);
    console.log(`Allowed origins: ${origins === "*" ? "*" : origins.join(", ")}`);
    console.log(`Echo to sender: ${echo}`);
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down`);
    io.close(() => process.exit(0));
    // Force exit if connections don't close in time
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

module.exports = { createSockster, parseOrigins };
