import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import baseConfig from "../../eslint.config.base.mjs";

const eslintConfig = defineConfig([
  ...baseConfig,
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // eslint-config-next 依赖的 eslint-plugin-react@7 与 ESLint 10 不兼容，
    // 配置自身不参与 lint，避免扩展/CLI 崩溃
    "eslint.config.mjs",
  ]),
]);

export default eslintConfig;
