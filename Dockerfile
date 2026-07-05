FROM node:22-alpine

LABEL org.opencontainers.image.source="https://github.com/djurnamn/sockster"
LABEL org.opencontainers.image.description="A small WebSocket server that broadcasts every event to all connected clients"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.authors="Björn Djurnamn <bjorn@djurnamn.co>"
LABEL org.opencontainers.image.url="https://hub.docker.com/r/djurnamn/sockster"

WORKDIR /app

RUN addgroup -S sockster && \
    adduser -S -G sockster sockster && \
    chown -R sockster:sockster /app

RUN npm install -g pnpm@11

COPY --chown=sockster:sockster package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --chown=sockster:sockster index.js ./

EXPOSE 4000

ENV SOCKSTER_PORT=4000 \
    SOCKSTER_ORIGIN_URL=http://localhost:3000 \
    NODE_ENV=production

USER sockster

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider "http://127.0.0.1:${SOCKSTER_PORT:-4000}/health" || exit 1

CMD ["node", "index.js"]
