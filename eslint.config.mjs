import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config} */
export default {
  overrides: [
    {
      files: ["**/*.{js,mjs,cjs,ts}"]
    }
  ],
  languageOptions: {
    globals: globals.browser
  },
  extends: [
    "eslint:recommended",
    ...tseslint.configs.recommended
  ],
  plugins: ["@typescript-eslint"],
};