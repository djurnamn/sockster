# 🔌 sockster

A lightweight, blazing-fast WebSocket server that broadcasts all events to connected clients. Perfect for real-time applications, chat systems, or any project requiring WebSocket functionality.

<div align="center">

[![npm version](https://badge.fury.io/js/sockster.svg)](https://badge.fury.io/js/sockster)
[![Docker Pulls](https://img.shields.io/docker/pulls/djurnamn/sockster.svg)](https://hub.docker.com/r/djurnamn/sockster)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## ✨ Features

- 🎯 **Simple to use** - Just start the server and it broadcasts all events
- 🔄 **Universal Broadcasting** - Every event is automatically broadcast to all connected clients
- 🛡️ **Production Ready** - Built-in CORS, error handling, and health checks
- 🐳 **Docker Support** - Ready-to-use Docker images with environment variable support
- 📦 **Easy Deployment** - Deploy anywhere with comprehensive environment variable support
- 🔌 **Socket.IO Powered** - Built on the reliable Socket.IO framework

## 🚀 Quick Start

### NPM

```bash
# Install the package
npm install sockster

# Create an .env file
echo "SOCKSTER_PORT=4000\nSOCKSTER_ORIGIN_URL=http://localhost:3000" > .env

# Start the server
npx sockster
```

### Docker

```bash
# Pull and run
docker run -p 4000:4000 -e SOCKSTER_ORIGIN_URL=http://localhost:3000 djurnamn/sockster
```

### Docker Compose

```yaml
services:
  sockster:
    image: djurnamn/sockster:latest
    ports:
      - "${SOCKSTER_PORT:-4000}:4000"
    environment:
      - SOCKSTER_PORT=4000
      - SOCKSTER_ORIGIN_URL=http://localhost:3000
```

## 🔌 Client Connection

Connect from your frontend application (JavaScript/TypeScript):

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

// Listen for connection
socket.on("connect", () => {
  console.log("Connected to sockster! 🎉");
});

// Send an event
socket.emit("my-event", { data: "Hello!" });

// Listen for events
socket.on("my-event", (data) => {
  console.log("Received:", data);
});
```

## 🌍 Production Deployment

### Railway (Recommended)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Deploy to Railway:
   ```bash
   railway login
   railway init
   railway up
   ```

3. Set environment variables:
   ```bash
   railway variables add SOCKSTER_ORIGIN_URL=https://your-frontend-app.com
   ```

4. Get your WebSocket URL:
   ```bash
   railway domain
   ```

5. Update your client configuration:
   ```javascript
   const socket = io("wss://your-app-name.railway.app");
   ```

## ⚙️ Environment Variables

| Variable             | Description                           | Default     |
|---------------------|---------------------------------------|-------------|
| SOCKSTER_PORT       | Port to run the server on             | 4000        |
| SOCKSTER_ORIGIN_URL | Allowed CORS origin                   | -           |

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/djurnamn/sockster.git

# Install dependencies
pnpm install

# Start the server
pnpm start
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Socket.IO](https://socket.io/) - Reliable real-time framework
- [dotenv](https://github.com/motdotla/dotenv) - Environment variable management

## 🌟 Star Us!

If you find sockster helpful, please consider giving it a star ⭐️ It helps others discover the project!
