FROM node:18-alpine

# Add labels for better container management
LABEL org.opencontainers.image.source="https://github.com/djurnamn/sockster"
LABEL org.opencontainers.image.description="A lightweight WebSocket server that broadcasts all events"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.authors="Björn Djurnamn <bjorn@djurnamn.co>"
LABEL org.opencontainers.image.url="https://hub.docker.com/r/djurnamn/sockster"

# Create app directory
WORKDIR /app

# Create a non-root user
RUN addgroup -S sockster && \
    adduser -S -G sockster sockster && \
    chown -R sockster:sockster /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY --chown=sockster:sockster package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy app source
COPY --chown=sockster:sockster . .

# Make index.js executable
RUN chmod +x index.js

# Expose default port
EXPOSE 4000

# Set default environment variables
ENV SOCKSTER_PORT=4000 \
    SOCKSTER_ORIGIN_URL=http://localhost:3000 \
    NODE_ENV=production

# Switch to non-root user
USER sockster

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bash -c 'wget --no-verbose --tries=1 --spider http://localhost:${SOCKSTER_PORT:-4000} > /dev/null 2>&1 & wait $!'

# Use node directly instead of pnpm for better signal handling
CMD ["./index.js"] 