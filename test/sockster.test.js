"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { io: connect } = require("socket.io-client");

const { createSockster, parseOrigins } = require("../index.js");

async function startServer(options) {
  const { httpServer, io } = createSockster(options);
  httpServer.listen(0);
  await once(httpServer, "listening");
  const { port } = httpServer.address();
  return {
    port,
    url: `http://localhost:${port}`,
    close: () => new Promise((resolve) => io.close(resolve)),
  };
}

function connectClient(url) {
  const socket = connect(url, { transports: ["websocket"] });
  return once(socket, "connect").then(() => socket);
}

function waitForEvent(socket, eventName, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out waiting for "${eventName}"`)),
      timeoutMs
    );
    socket.once(eventName, (...args) => {
      clearTimeout(timer);
      resolve(args);
    });
  });
}

test("broadcasts events to all clients, including the sender", async (t) => {
  const server = await startServer({ echo: true });
  t.after(() => server.close());

  const [sender, receiver] = await Promise.all([
    connectClient(server.url),
    connectClient(server.url),
  ]);
  t.after(() => {
    sender.disconnect();
    receiver.disconnect();
  });

  const senderGot = waitForEvent(sender, "greeting");
  const receiverGot = waitForEvent(receiver, "greeting");

  sender.emit("greeting", { message: "hello" });

  assert.deepEqual(await receiverGot, [{ message: "hello" }]);
  assert.deepEqual(await senderGot, [{ message: "hello" }]);
});

test("with echo disabled, the sender does not receive its own event", async (t) => {
  const server = await startServer({ echo: false });
  t.after(() => server.close());

  const [sender, receiver] = await Promise.all([
    connectClient(server.url),
    connectClient(server.url),
  ]);
  t.after(() => {
    sender.disconnect();
    receiver.disconnect();
  });

  let senderReceived = false;
  sender.on("greeting", () => {
    senderReceived = true;
  });

  const receiverGot = waitForEvent(receiver, "greeting");
  sender.emit("greeting", "hi");

  assert.deepEqual(await receiverGot, ["hi"]);
  // Give any stray echo a moment to arrive before asserting it didn't
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(senderReceived, false);
});

test("relays events with multiple arguments", async (t) => {
  const server = await startServer({ echo: true });
  t.after(() => server.close());

  const [sender, receiver] = await Promise.all([
    connectClient(server.url),
    connectClient(server.url),
  ]);
  t.after(() => {
    sender.disconnect();
    receiver.disconnect();
  });

  const receiverGot = waitForEvent(receiver, "multi");
  sender.emit("multi", 1, "two", { three: 3 });

  assert.deepEqual(await receiverGot, [1, "two", { three: 3 }]);
});

test("GET /health returns status and connection count", async (t) => {
  const server = await startServer({});
  t.after(() => server.close());

  const client = await connectClient(server.url);
  t.after(() => client.disconnect());

  const response = await fetch(`${server.url}/health`);
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.equal(body.connections, 1);
  assert.equal(typeof body.uptime, "number");
});

test("unknown HTTP routes return 404", async (t) => {
  const server = await startServer({});
  t.after(() => server.close());

  const response = await fetch(`${server.url}/nope`);
  assert.equal(response.status, 404);
});

test("parseOrigins handles defaults, lists, and wildcard", () => {
  assert.deepEqual(parseOrigins(undefined), ["http://localhost:3000"]);
  assert.deepEqual(parseOrigins(""), ["http://localhost:3000"]);
  assert.deepEqual(parseOrigins("https://app.example.com"), [
    "https://app.example.com",
  ]);
  assert.deepEqual(
    parseOrigins("https://a.example.com, https://b.example.com"),
    ["https://a.example.com", "https://b.example.com"]
  );
  assert.equal(parseOrigins("*"), "*");
  assert.deepEqual(parseOrigins(" , "), ["http://localhost:3000"]);
});
