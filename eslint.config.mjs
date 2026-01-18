import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier: prettier,
    },
    rules: {
      'no-console': 'warn',
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },
]
