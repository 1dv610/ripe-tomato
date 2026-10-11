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
  // Architecture rules: the dependency direction from MVC_DESIGN.md, checked on every lint run
  // instead of only in code review. models/ depends on nothing, views/ and controllers/ depend
  // on models/, and only index.js knows every part.
  {
    files: ['src/js/models/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['p5', '**/views/**', '**/controllers/**', '**/index.js'],
              message: 'The model must run without the interface (and in Node, e.g. to verify a score on a server).',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        ...['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'fetch'].map((name) => ({
          name,
          message: 'The model must not touch the browser. Let the caller pass in what the model needs.',
        })),
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'Inject a random function so tests and replays are deterministic.',
        },
        {
          object: 'Date',
          property: 'now',
          message: 'Time is passed to update(dt); the model does not read the clock.',
        },
        {
          object: 'performance',
          property: 'now',
          message: 'Time is passed to update(dt); the model does not read the clock.',
        },
      ],
    },
  },
  {
    files: ['src/js/views/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/controllers/**', '**/index.js'],
              message: 'Views read the model and draw; they never depend on the controller.',
            },
          ],
        },
      ],
      // Imports can't tell reading the model from changing it, so calls to Game's commands are
      // matched by name. Keep the list in sync with the commands Game exposes.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression > MemberExpression.callee[property.type='Identifier'][property.name=/^(jump|steer|restart|update)$/]",
          message: 'Views only read the model. Commands are sent by the controller, and time is advanced by the loop.',
        },
      ],
    },
  },
  {
    files: ['src/js/controllers/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['p5'],
              message: 'Controllers receive plain values from the sketch, so they are testable without p5.',
            },
            {
              group: ['**/views/**', '!**/views/Camera.js'],
              message: 'Controllers send commands to the model and may share the Camera, but never draw.',
            },
            { group: ['**/index.js'], message: 'Only index.js knows every part.' },
          ],
        },
      ],
    },
  },
  prettier,
]
