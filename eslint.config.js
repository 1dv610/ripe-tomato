import config from '@lnu/eslint-config'
import prettier from 'eslint-config-prettier'
import html from '@html-eslint/eslint-plugin'
import vitest from '@vitest/eslint-plugin'

export default [
  ...config,
  {
    // Catches test-hygiene mistakes that are easy to leave behind by accident, most
    // importantly it.only()/describe.only() — those silently skip every other test in
    // the file, with no error, which is exactly the kind of thing worth a linter for.
    ...vitest.configs.recommended,
    files: ['src/**/*.test.js'],
  },
  {
    ...html.configs['flat/recommended'],
    files: ['src/*.html'],
    rules: {
      ...html.configs['flat/recommended'].rules,
      // Formatting is Prettier's job, not the linter's — these fight Prettier's own HTML output.
      '@html-eslint/attrs-newline': 'off',
      '@html-eslint/element-newline': 'off',
      '@html-eslint/indent': 'off',
      '@html-eslint/no-extra-spacing-tags': 'off',
      '@html-eslint/quotes': 'off',
      '@html-eslint/require-closing-tags': 'off',
    },
  },
  {
    // Component templates are inert markup fragments injected into a <template> element via
    // a Vite `?raw` import, not full documents — document-level rules (doctype, <html>, <head>,
    // page <title>, ...) don't apply to them.
    ...html.configs['flat/recommended'],
    files: ['src/js/components/**/*.html'],
    rules: {
      ...html.configs['flat/recommended'].rules,
      '@html-eslint/attrs-newline': 'off',
      '@html-eslint/element-newline': 'off',
      '@html-eslint/indent': 'off',
      '@html-eslint/no-extra-spacing-tags': 'off',
      '@html-eslint/quotes': 'off',
      '@html-eslint/require-closing-tags': 'off',
      '@html-eslint/require-doctype': 'off',
      '@html-eslint/require-html-element': 'off',
      '@html-eslint/require-lang': 'off',
      '@html-eslint/require-title': 'off',
      '@html-eslint/no-multiple-h1': 'off',
    },
  },
  prettier,
]
