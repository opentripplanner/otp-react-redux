module.exports = {
  extends: [
    'standard',
    'standard-jsx',
    'react-app',
    'plugin:@typescript-eslint/recommended',
    'plugin:typescript-sort-keys/recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
    'plugin:jsx-a11y/strict',
    'plugin:prettier/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'sort-keys-fix',
    'import',
    'jest',
    'jsx-a11y',
    'react',
    'sort-destructure-keys',
    'sort-imports-es6-autofix',
    'typescript-sort-keys'
  ],
  rules: {
    '@typescript-eslint/member-delimiter-style': [
      'off',
      {
        multiline: {
          delimiter: 'none',
          requireLast: false
        },
        singleline: {
          delimiter: 'comma',
          requireLast: false
        }
      }
    ],
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-var-requires': 0,
    complexity: ['warn', 12],
    'import/order': [
      'warn',
      {
        'newlines-between': 'always'
      }
    ],
    'jsx-a11y/label-has-for': [
      2,
      {
        allowChildren: false,
        components: ['Label'],
        required: {
          every: ['id']
        }
      }
    ],
    // from docs: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md#how-to-use
    // it must be disabled to work correctly
    'no-use-before-define': 'off',
    'object-curly-spacing': 0,
    'prefer-const': [
      'warn',
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: false
      }
    ],
    'prettier/prettier': [
      'error',
      {
        semi: false,
        singleQuote: true,
        trailingComma: 'none'
      }
    ],
    quotes: [2, 'single', { avoidEscape: true }],
    'react/jsx-handler-names': 'off',
    'react/jsx-sort-props': [
      'error',
      {
        ignoreCase: true
      }
    ],
    'sort-destructure-keys/sort-destructure-keys': [
      'error',
      {
        caseSensitive: false
      }
    ],
    'sort-imports-es6-autofix/sort-imports-es6': [
      2,
      {
        ignoreCase: true,
        ignoreMemberSort: false
      }
    ],
    'sort-keys': [
      'error',
      'asc',
      {
        caseSensitive: false
      }
    ],
    'sort-keys-fix/sort-keys-fix': [
      'warn',
      'asc',
      {
        caseSensitive: false
      }
    ],
    'sort-vars': [
      'error',
      {
        ignoreCase: true
      }
    ]
  },
  settings: {
    react: {
      version: '999.999.999'
    }
  }
}
