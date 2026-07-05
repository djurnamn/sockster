# sockster

[![npm](https://img.shields.io/npm/v/sockster)](https://www.npmjs.com/package/sockster)
[![Docker pulls](https://img.shields.io/docker/pulls/djurnamn/sockster)](https://hub.docker.com/r/djurnamn/sockster)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

A small WebSocket server that relays every event it receives to all connected clients. Point any number of Socket.IO clients at it and whatever one emits, the rest receive - no rooms to join and no server-side handlers to write.

I built it because I kept needing a realtime backend for prototypes and didn't want to write the same relay server again each time. It's a container you start, not a framework you extend.

## Quick start

### npm

```bash
npm install sockster
npx sockster
```

Configuration comes from environment variables, or from an `.env` file in the directory you run it from (see [Configuration](#configuration)).

### Docker

```bash
docker run -p 4000:4000 -e SOCKSTER_ORIGIN_URL=http://localhost:3000 djurnamn/sockster
```

### Docker Compose

```yaml
services:
  sockster:
    image: djurnamn/sockster:latest
    ports:
      - "4000:4000"
    environment:
      - SOCKSTER_ORIGIN_URL=http://localhost:3000
```

## Connecting a client

Use any Socket.IO client. Events pass through as-is, so both sides just agree on event names:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

// Everything any client emits comes back out here
socket.on("cursor-moved", ({ x, y }) => {
  drawCursor(x, y);
});

socket.emit("cursor-moved", { x: 128, y: 64 });
```

By default the sender receives its own events back too, which keeps every client on the same code path. If your clients render their own actions optimistically, set `SOCKSTER_ECHO=false` and events only go to the *other* clients.

## Configuration

| Variable              | Default                 | Description                                                                                   |
|-----------------------|-------------------------|-----------------------------------------------------------------------------------------------|
| `SOCKSTER_PORT`       | `4000`                  | Port the server listens on                                                                     |
| `SOCKSTER_ORIGIN_URL` | `http://localhost:3000` | Allowed CORS origin(s) - a single origin, a comma-separated list, or `*` to allow any origin   |
| `SOCKSTER_ECHO`       | `true`                  | Whether events are echoed back to the client that sent them; `false` relays to everyone else   |

## Health endpoint

`GET /health` returns the server state:

```json
{ "status": "ok", "uptime": 12.3, "connections": 2 }
```

The Docker image uses it for its built-in healthcheck, and it works as a probe target on any hosting platform.

## Deploying

The image runs anywhere containers do - Railway, Fly.io, a VPS with Docker. Set `SOCKSTER_ORIGIN_URL` to your frontend's origin and point clients at the deployed URL; Socket.IO handles the upgrade to `wss` when the page is served over https. The server shuts down cleanly on SIGTERM, so rolling deploys close connections instead of dropping them.

## What it isn't

There's no authentication and no persistence - every connected client sees every event, and events emitted while a client is disconnected are gone. That's the design, but it means sockster fits prototypes, local tools, and trusted environments rather than anything carrying sensitive data. It's also single-instance: there's no adapter for fanning out across multiple nodes.

## Development

```bash
git clone https://github.com/djurnamn/sockster.git
cd sockster
pnpm install
pnpm test
pnpm start
```

Tests use Node's built-in test runner, so `node >= 20` is the only requirement.

## License

MIT - see [LICENSE](LICENSE).
