import nodeExternals from "rollup-plugin-node-externals";
import { defineConfig } from "vite";
import type { LibraryFormats } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(() => {
  return {
    plugins: [
      nodeExternals({
        builtins: true,
        deps: false,
      }),
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/ps-list/vendor",
            dest: "",
          },
        ],
      }),
    ],
    build: {
      rollupOptions: {
        external: ["vscode"],
        treeshake: {
          moduleSideEffects: false,
        },
      },
      lib: {
        entry: "src/extension.ts",
        formats: ["cjs"] satisfies LibraryFormats[],
        fileName: () => "extension.js",
      },
      sourcemap: true,
      outDir: "dist",
    },
  };
});
