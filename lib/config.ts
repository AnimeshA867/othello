// Configuration settings for different environments
export const config = {
  // WebSocket server settings
  wsServer: {
    // For local development
    development: {
      protocol: "ws",
      host:
        typeof window !== "undefined" ? window.location.hostname : "localhost",
      port: 3003,
    },
    // For production (Render)
    production: {
      protocol: "wss",
      host: process.env.NEXT_PUBLIC_WS_HOST || "othello-86eg.onrender.com",
      port: null, // Usually not needed with wss as it uses standard HTTPS port
    },
  },

  // Build the WebSocket URL based on environment
  getWebSocketUrl: () => {
    const isProduction = process.env.NODE_ENV === "production";
    const env = isProduction ? "production" : "development";
    const { protocol, host, port } = config.wsServer[env];

    return port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
  },
};
