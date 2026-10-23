/**
 * Apply the existing TypeScript lint rules to maintained source while excluding
 * generated build and browser-test output. This file does not relax any rule.
 */
import tseslint from 'typescript-eslint';
export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.nx/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...tseslint.configs.recommended,
);
