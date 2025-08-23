"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enhancedWebSocketServer_1 = __importDefault(require("./enhancedWebSocketServer"));
const http_1 = __importDefault(require("http"));
// Start the server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;
try {
    console.log(`Starting Othello server on port ${port}...`);
    // Create an HTTP server to handle the upgrade
    const httpServer = http_1.default.createServer((req, res) => {
        // Add CORS headers to all responses
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        // Basic health check endpoint
        if (req.url === "/health") {
            res.writeHead(200);
            res.end("OK");
            return;
        }
        // Handle CORS preflight
        if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
            return;
        }
        // For all other requests, return a simple message
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Othello WebSocket Server is running");
    });
    // Start the HTTP server
    httpServer.listen(port, () => {
        console.log(`HTTP server started on port ${port}`);
        // Initialize the WebSocket server with the HTTP server
        const wsServer = new enhancedWebSocketServer_1.default(httpServer);
        console.log(`WebSocket server attached to HTTP server`);
        // Log important information about the environment
        console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
        console.log(`Host: ${process.env.HOST || "0.0.0.0"}`);
    });
    // Graceful shutdown
    process.on("SIGTERM", () => {
        console.log("Received SIGTERM, shutting down gracefully");
        httpServer.close(() => {
            process.exit(0);
        });
    });
}
catch (error) {
    console.error(`Failed to start server:`, error);
    process.exit(1);
}
