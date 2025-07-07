module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier + displays Prettier errors as ESLint errors
    'prettier',                    // Disables ESLint rules that conflict with Prettier
  ],
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    // Customize rules here
    'prettier/prettier': 'warn',
    'max-len': ['warn', { code: 100 }],
    // Optional Vue/TS rules
    'vue/max-attributes-per-line': ['warn', { singleline: 3 }],
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
