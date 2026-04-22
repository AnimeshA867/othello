import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    clearMocks: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname),
    },
  },
});
