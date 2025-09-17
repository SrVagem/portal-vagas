// eslint.config.mjs
import { fileURLToPath } from "url";
import { dirname } from "path";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // Ignorar artefatos de build e tipos gerados
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "next-env.d.ts",
      "**/*.d.ts",
    ],
  },

  // Presets oficiais do Next (inclui TS e React)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Suas regras do projeto
  {
    rules: {
      // Desbloqueio imediato para o caso de uso do projeto
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // Mantém só como aviso – ajuda a não esquecer dependências de hooks
      "react-hooks/exhaustive-deps": "warn",

      // Se você exporta componentes utilitários junto com componentes React em arquivos client
      "react-refresh/only-export-components": "off",
    },
  },
];
