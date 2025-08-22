// server.js
// Check if we're in production (built files in dist/) or development (use ts-node)
if (process.env.NODE_ENV === "production") {
  // In production, use the compiled JavaScript files
  require("./dist/server/index.js");
} else {
  // In development, use ts-node to run TypeScript directly
  require("ts-node").register({ project: "./tsconfig.server.json" });
  require("./server/index.ts");
}
