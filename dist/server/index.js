"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enhancedWebSocketServer_1 = __importDefault(require("./enhancedWebSocketServer"));
// Start the server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;
try {
    console.log(`Starting Othello server on port ${port}...`);
    const server = new enhancedWebSocketServer_1.default(port);
    console.log(`Othello server started on port ${port}`);
}
catch (error) {
    console.error("Failed to start Othello server:", error);
    process.exit(1);
}
