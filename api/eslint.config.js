// ESLint 9 · configuración "flat" de la API (CommonJS)
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/', 'coverage/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // next se declara en los middlewares de error aunque no se use
      'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^(next|_)' }],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.jest } },
  },
];
