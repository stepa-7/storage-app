module.exports = {
  root: true,
  env: { browser: true, es2023: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "detect" } },
  plugins: ["react", "react-hooks", "@typescript-eslint", "unused-imports", "prettier", "import"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  rules: {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "unused-imports/no-unused-imports": "error",
    "import/order": [
      "warn",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ]
  }
};
