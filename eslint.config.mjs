import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', '.idea/**'],
  },
  js.configs.recommended,
  {
    // Extension sources are classic scripts, not ES modules: the MV3 worker is
    // declared without `"type": "module"`, and welcome.js is a plain <script>.
    files: ['service-worker.js', 'welcome.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'script',
    },
    rules: {
      eqeqeq: 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['service-worker.js'],
    languageOptions: {
      globals: { ...globals.serviceworker, ...globals.webextensions },
    },
  },
  {
    files: ['welcome.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.webextensions },
    },
  },
];
