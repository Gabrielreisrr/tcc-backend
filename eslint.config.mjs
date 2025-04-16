import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.browser,
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier: "eslint-plugin-prettier",
    },
    extends: [
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
      "plugin:prettier/recommended",
    ],
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      semi: ["error", "always"],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "prefer-const": "warn",
      "no-console": "warn",
      "prettier/prettier": "error",
      "no-debugger": "error",
      eqeqeq: "error",
      "no-trailing-spaces": "warn",
      curly: ["error", "all"],
      indent: ["error", 2],
      quotes: ["error", "double"],
    },
  },
];
