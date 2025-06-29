// vite.config.ts

import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "AuthApiClient",
      fileName: (format) => `request-kit-client.${format}.js`,
    },
    rollupOptions: {
      external: ["axios"],
      output: {
        globals: {
          axios: "axios",
        },
      },
    },
  },
});

