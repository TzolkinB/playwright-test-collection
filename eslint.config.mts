import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier/flat'

export default defineConfig([
  {
    files: ['**/*.{ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    // languageOptions: { globals: {...globals.browser, ...globals.node} } },
    languageOptions: {
      parserOptions: {
        project: '.tsconfig.json',
      },
    },
    rules: {},
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
])
