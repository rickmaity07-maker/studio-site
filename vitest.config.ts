import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests: pure logic only (validation, passwords, email templates).
// Browser flows live in e2e/ and run with Playwright.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) }
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node"
  }
});
