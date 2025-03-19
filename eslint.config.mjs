import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.browser
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Variáveis não utilizadas geram aviso
      "semi": ["error", "always"], // Exige ponto e vírgula
      "@typescript-eslint/no-explicit-any": "error", // Proíbe uso de `any`
      "prefer-const": "warn" // Sugere `const` quando possível
    }
  }
];
