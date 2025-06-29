import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // so you can use `describe`, `it`, `expect` globally
    include: ["tests/**/*.test.ts"], // where your tests live
    coverage: {
      reporter: ["text", "html", "json"], // optional: for code coverage
    },
  },
});
