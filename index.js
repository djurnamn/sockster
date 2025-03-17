#!/usr/bin/env node

require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");

// Environment variables with defaults
const PORT = process.env.SOCKSTER_PORT || 4000;
const ORIGIN_URL = process.env.SOCKSTER_ORIGIN_URL || "http://localhost:3000";

// Create HTTP server
const server = createServer();

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: ORIGIN_URL,
    methods: ["GET", "POST"],
  },
  // Add some basic security measures
  connectionStateRecovery: {
    // Enable connection state recovery
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
  },
  pingTimeout: 60000, // Timeout if client doesn't respond to ping
  pingInterval: 25000, // How often to ping clients
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`Client connected [id=${socket.id}]`);

  // Listen for and broadcast all events
  socket.onAny((eventName, ...args) => {
    console.log(`Event received [${eventName}]:`, ...args);
    io.emit(eventName, ...args);
  });

  // Handle disconnections
  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected [id=${socket.id}] due to ${reason}`);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket error [id=${socket.id}]:`, error);
  });
});

// Handle server errors
server.on("error", (error) => {
  console.error("Server error:", error);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`);
  console.log(`Allowing CORS from origin: ${ORIGIN_URL}`);
});

