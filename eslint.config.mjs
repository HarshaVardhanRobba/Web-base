import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Code the Trigger.dev worker runs. It runs plain Node outside Next, so a
    // Next or React import here either throws at import time or bloats the
    // bundle. scripts/check-trigger.mjs enforces the same rule across the whole
    // module graph, including files these ones import; this block is the fast
    // signal in the editor.
    files: [
      "src/trigger/**/*.ts",
      "workflows/tasks/**/*.ts",
      "workflows/lib/**/*.ts",
      "workflows/nodes/executors/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              allowTypeImports: true,
              message: "It throws outside Next. The worker runs plain Node.",
            },
            {
              name: "@/lib/db",
              allowTypeImports: true,
              message:
                "That module is guarded by server-only. Import @/lib/db/client instead.",
            },
            {
              name: "react",
              allowTypeImports: true,
              message: "The worker renders nothing.",
            },
            {
              name: "react-dom",
              allowTypeImports: true,
              message: "The worker renders nothing.",
            },
            {
              name: "@xyflow/react",
              allowTypeImports: true,
              message: "Canvas-only code does not belong in a task.",
            },
            {
              name: "lucide-react",
              allowTypeImports: true,
              message: "Icon components do not belong in a task.",
            },
          ],
          patterns: [
            {
              group: ["next/*", "@clerk/nextjs", "@clerk/nextjs/*"],
              allowTypeImports: true,
              message:
                "Next and Clerk server helpers need a request, which a task does not have.",
            },
            {
              group: ["@liveblocks/react", "@liveblocks/react/*"],
              allowTypeImports: true,
              message: "Client-only code does not belong in a task.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
