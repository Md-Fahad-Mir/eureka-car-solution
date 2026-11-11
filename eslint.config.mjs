import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Mock data is only reachable through the service layer (src/lib/api),
    // so swapping in a real API never touches UI code.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/api/**", "src/data/**", "src/**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/data/mock", "@/data/mock/*", "**/data/mock/*"],
              message: "Import data through src/lib/api/* instead of reading mock data directly.",
            },
            {
              group: ["@/stores/demoRecords", "**/stores/demoRecords"],
              message: "Demo records are mock-mode server storage: read and write them through src/lib/api/*.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "playwright-report/**", "test-results/**", "public/draco/**"]),
]);

export default eslintConfig;
