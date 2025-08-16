import EnhancedOthelloWebSocketServer from "./enhancedWebSocketServer";

// Start the server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;

try {
  console.log(`Starting Othello server on port ${port}...`);
  const server = new EnhancedOthelloWebSocketServer(port);
  console.log(`Othello server started on port ${port}`);
} catch (error) {
  console.error("Failed to start Othello server:", error);
  process.exit(1);
}
