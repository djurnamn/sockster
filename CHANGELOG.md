# Changelog

## 1.1.0 - 2026-07-06

### Fixed

- Clients no longer receive a stray string appended after every event payload. Connection state recovery was leaking its internal offset id as an extra argument to every broadcast; the feature is removed.
- `docker-compose.yml` set `PORT` and `ORIGIN_URL`, but the server reads `SOCKSTER_PORT` and `SOCKSTER_ORIGIN_URL` - the compose configuration was silently ignored.
- The Docker healthcheck invoked `bash`, which doesn't exist in the Alpine image, and probed a path that had no handler. It now probes the new `/health` endpoint.

### Added

- `GET /health` endpoint returning status, uptime, and connection count.
- `SOCKSTER_ECHO` environment variable. Defaults to `true` (current behavior, events echo back to the sender); `false` relays only to the other clients.
- `SOCKSTER_ORIGIN_URL` accepts a comma-separated list of origins, or `*`.
- Graceful shutdown on SIGTERM/SIGINT - connections close cleanly instead of the container being killed after Docker's stop timeout.
- A test suite (`pnpm test`, Node's built-in runner) covering broadcasting, echo behavior, the health endpoint, and origin parsing.

### Changed

- Docker base image is now `node:22-alpine` (Node 18 reached end of life).
- Dependencies updated: socket.io 4.8, dotenv 17.
- Requires Node >= 20.

## 1.0.1 - 2025-05-22

- Version bump, no functional changes.

## 1.0.0 - 2025-03-17

- Initial release.
