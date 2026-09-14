import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    // `storybook-static` and `packages/*/r` are BUILD OUTPUT. The registry is
    // committed (it needs a raw URL and a copy inside the package), which is
    // exactly why it has to be named here: it is generated, not authored.
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "storybook-static/**",
      "packages/*/r/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Node scripts: `process`, `console` and the WHATWG globals are real here, and
    // `js.configs.recommended`'s `no-undef` has no environment to read them from.
    files: ["**/*.mjs", "**/*.config.ts", "**/*.config.mjs"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly", URL: "readonly" },
    },
  },
  prettier,
);
