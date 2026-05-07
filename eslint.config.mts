import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier/flat'
import eslintPluginPlaywright from 'eslint-plugin-playwright'

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },
  // Playwright-specific rules for test files only
  {
    files: ['tests/**/*.{ts,js}'],
    ...eslintPluginPlaywright.configs['flat/recommended'],
    rules: {
      ...eslintPluginPlaywright.configs['flat/recommended'].rules,
      'playwright/expect-expect': [
        'warn',
        { assertFunctionNames: ['verifyMessage', 'verifyLink', 'yourMove'] },
      ],
    },
  },
  // Ensure Prettier applies to ALL files
  {
    files: ['**/*.{ts,js,mts,cts}'],
    ...prettierConfig,
  },
])
