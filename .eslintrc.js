const namingConventions = [
    {
        selector: 'default',
        format: ['camelCase']
    },
    {
        selector: 'variable',
        modifiers: ['const'],
        format: ['camelCase', 'UPPER_CASE']
    },
    {
        selector: 'variable',
        modifiers: ['unused'],
        leadingUnderscore: 'require',
        format: ['camelCase']
    },
    {
        selector: 'variable',
        modifiers: ['unused', 'destructured'],
        leadingUnderscore: 'allow',
        format: ['camelCase']
    },
    {
        selector: 'property',
        format: ['camelCase', 'UPPER_CASE']
    },
    {
        selector: 'parameter',
        modifiers: ['unused'],
        leadingUnderscore: 'require',
        format: ['camelCase']
    },
    {
        selector: 'typeLike',
        format: ['PascalCase']
    },
    {
        selector: 'enumMember',
        format: ['UPPER_CASE']
    },
    {
        selector: 'objectLiteralProperty',
        modifiers: ['requiresQuotes'],
        format: null
    }
]

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    env: {
        es6: true,
        node: true
    },
    ignorePatterns: [
        '.idea',
        'build',
        'data',
        'node_modules',
        'package-lock.json'
    ],
    plugins: [
        '@typescript-eslint',
        'filenames',
        'import',
        'promise',
        'deprecation'
    ],
    extends: [
        'eslint:all',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:promise/recommended'
    ],
    rules: {
        // http://eslint.org/docs/rules/
        'array-bracket-newline': ['error', 'consistent'],
        'array-element-newline': 'off',
        'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
        'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
        'callback-return': ['error', ['callback', 'cb', 'done']],
        'class-methods-use-this': 'off',
        'consistent-return': 'off',
        'capitalized-comments': 'off',
        'default-case': 'off',
        'dot-location': ['error', 'property'],
        'eol-last': ['error', 'always'],
        'function-call-argument-newline': ['error', 'consistent'],
        'function-paren-newline': 'off',
        'id-length': 'off',
        'implicit-arrow-linebreak': 'off',
        'indent': ['error', 4, {
            SwitchCase: 1,
            // workaround until https://github.com/typescript-eslint/typescript-eslint/issues/1824 is fixed
            ignoredNodes: [
                'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key'
            ]
        }],
        'init-declarations': 'off',
        'line-comment-position': 'off',
        'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
        'max-len': ['error', { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true }],
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'max-params': ['error', { max: 5 }],
        'max-statements': 'off',
        'multiline-comment-style': 'off',
        'multiline-ternary': ['error', 'always-multiline'],
        'new-cap': ['error', { capIsNew: false }],
        'newline-after-var': ['error', 'always'],
        'newline-per-chained-call': ['error', { ignoreChainWithDepth: 6 }],
        'no-await-in-loop': 'error',
        'no-confusing-arrow': 'off',
        'no-console': 'off',
        'no-extra-parens': 'off',
        'no-inline-comments': 'off',
        'no-invalid-this': 'off',
        'no-magic-numbers': 'off',
        'no-multi-spaces': ['error', { ignoreEOLComments: true }],
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
        'no-nested-ternary': 'off',
        'no-plusplus': 'off',
        'no-process-env': 'off',
        'no-prototype-builtins': 'error',
        'no-shadow': 'off',
        'no-sync': 'off',
        'no-template-curly-in-string': 'error',
        'no-ternary': 'off',
        'no-trailing-spaces': 'error',
        'no-undefined': 'off',
        'no-unused-expressions': ['error', { allowTernary: true }],
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
        'no-warning-comments': 'off',
        'object-curly-newline': ['error', {
            ObjectExpression: { multiline: true, consistent: true },
            ObjectPattern: { multiline: true, consistent: true },
            ImportDeclaration: { multiline: true },
            ExportDeclaration: { multiline: true, consistent: true, minProperties: 3 }
        }],
        'object-curly-spacing': ['error', 'always'],
        'object-property-newline': 'off',
        'one-var': ['error', { uninitialized: 'always', initialized: 'never' }],
        'padded-blocks': ['error', 'never'],
        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
            { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
            { blankLine: 'always', prev: '*', next: 'return' }
        ],
        'prefer-named-capture-group': 'off',
        'require-atomic-updates': 'off',
        'quote-props': ['error', 'consistent-as-needed'],
        'quotes': ['error', 'single', { avoidEscape: true }],
        'require-jsdoc': 'off',
        'require-unicode-regexp': 'off',
        'semi': ['error', 'never'],
        'sort-imports': 'off',
        'sort-keys': 'off',
        'strict': 'off',
        'deprecation/deprecation': 'warn',

        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'none' } }],
        '@typescript-eslint/naming-convention': ['error', ...namingConventions],
        '@typescript-eslint/no-extra-parens': ['error', 'all', { returnAssign: false, nestedBinaryExpressions: false }],
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, varsIgnorePattern: '^_+$' }],
        '@typescript-eslint/no-use-before-define': 'error',

        // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
        'import/default': 'error',
        'import/export': 'error',
        'import/exports-last': 'off',
        'import/extensions': ['error', 'never', { json: 'always', scss: 'always' }],
        'import/first': 'error',
        'import/group-exports': 'off',
        'import/max-dependencies': ['error', { max: 25 }],
        'import/named': 'error',
        'import/namespace': ['error', { allowComputed: true }],
        'import/newline-after-import': 'error',
        'import/no-absolute-path': 'error',
        'import/no-amd': 'error',
        'import/no-anonymous-default-export': 'off',
        'import/no-commonjs': 'error',
        'import/no-cycle': 'error',
        'import/no-default-export': 'off',
        'import/no-deprecated': 'error',
        'import/no-duplicates': 'error',
        'import/no-dynamic-require': 'error',
        'import/no-extraneous-dependencies': ['error', {
            devDependencies: [
                '**/*.test.ts',
                'test/**/*.ts'
            ]
        }],
        'import/no-internal-modules': 'off',
        'import/no-mutable-exports': 'off',
        'import/no-named-as-default': 'off',
        'import/no-named-as-default-member': 'error',
        'import/no-named-default': 'error',
        'import/no-namespace': 'off',
        'import/no-nodejs-modules': 'off',
        'import/no-self-import': 'error',
        'import/no-unassigned-import': 'off',
        'import/no-unresolved': 'error',
        'import/no-restricted-paths': ['error', {
            zones: [
                { target: './src', from: './e2e' }
            ]
        }],
        'import/order': ['error', {
            'pathGroups': ['.', '..', '../..', '../../..', '../../../..'].map(p => ({
                pattern: `${p}/sentry`,
                group: 'internal',
                position: 'before'
            })),
            'groups': [['builtin', 'external'], ['internal', 'parent', 'type'], ['sibling', 'index']],
            'newlines-between': 'always'
        }],
        'import/no-unused-modules': 'error',
        'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
        'import/prefer-default-export': 'off',
        'import/unambiguous': 'error',

        // https://github.com/selaux/eslint-plugin-filenames#rules
        'filenames/match-regex': ['error', '^[a-z0-9-]+(\\.(d|test|e2e|fixture|schema|request|response))?$', true],
        'filenames/match-exported': ['error', 'kebab'],
        'filenames/no-index': 'off',

        // https://github.com/xjamundx/eslint-plugin-promise#rules
        'promise/always-return': 'error',
        'promise/avoid-new': 'error',
        'promise/catch-or-return': ['error', { allowFinally: true }],
        'promise/no-callback-in-promise': 'error',
        'promise/no-native': 'off',
        'promise/no-nesting': 'error',
        'promise/no-new-statics': 'error',
        'promise/no-promise-in-callback': 'error',
        'promise/no-return-in-finally': 'error',
        'promise/no-return-wrap': 'error',
        'promise/param-names': 'error',
        'promise/prefer-await-to-callbacks': 'error',
        'promise/prefer-await-to-then': 'error'
    },
    overrides: [
        {
            files: ['.eslintrc.js'],
            rules: {
                'filenames/match-regex': 'off',
                'import/no-commonjs': 'off',
                'import/unambiguous': 'off',
                '@typescript-eslint/naming-convention': 'off'
            }
        },
        {
            files: ['*.config.ts'],
            rules: {
                'filenames/match-exported': 'off'
            }
        },
        {
            files: ['*.d.ts'],
            rules: {
                'import/unambiguous': 'off'
            }
        },
        {
            files: ['src/db/entities/**/*.ts'],
            rules: {
                'import/no-cycle': 'off'
            }
        },
        {
            files: ['src/db/columns/**/*.ts'],
            rules: {
                '@typescript-eslint/naming-convention': ['error', ...namingConventions, {
                    selector: 'variable',
                    modifiers: ['exported'],
                    format: ['PascalCase']
                }]
            }
        },
        {
            files: ['src/index.ts', 'src/main/*/index.ts'],
            rules: {
                'promise/prefer-await-to-callbacks': 'off'
            }
        },
        {
            files: ['src/main/**/*.ts'],
            rules: {
                'max-depth': ['error', { max: 6 }],
                'no-continue': 'off',
                'no-await-in-loop': 'off'
            }
        }
    ]
}
