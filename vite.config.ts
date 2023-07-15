import { execFileSync } from "node:child_process";
import { defineConfig } from "vitest/config";

const decoder = new TextDecoder();

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["cjs"],
      fileName: () => "code.js",
    },
    rollupOptions: {
      treeshake: false,
    },
    outDir: ".",
    minify: false,
  },
  resolve: {
    alias: [
      {
        find: "aspida",
        replacement: "aspida-google-apps-script",
      },
    ],
  },
  // plugins: [
  //   {
  //     name: "clasp-push",
  //     closeBundle: () => {
  //       const result = execFileSync("pnpm", ["run", "push"]);
  //       console.log(decoder.decode(result));
  //     },
  //   },
  // ],

  test: {
    includeSource: ["src/**/*.{js,ts}"],
  },
});
