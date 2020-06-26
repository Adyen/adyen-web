module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['react', '@typescript-eslint', 'import', 'eslint-plugin-tsdoc'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended' /*'prettier/@typescript-eslint'*/
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
            modules: true,
            jsx: true
        }
    },
    env: {
        browser: true,
        node: true,
        jest: true,
        es6: true
    },
    settings: {
        react: {
            pragma: 'h',
            version: '16.0'
        },
        'import/resolver': {
            webpack: {
                config: 'config/webpack.dev.js'
            }
        }
    },
    rules: {
        'no-console': 0,
        'class-methods-use-this': 'off', // TODO
        'no-underscore-dangle': 'off', // TODO
        'import/prefer-default-export': 'off',
        'no-debugger': 'warn',
        indent: 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never'
            }
        ],
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'max-len': [
            'error',
            {
                code: 150,
                tabWidth: 2,
                ignoreComments: true, // Allow long comments in the code
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true
            }
        ],
        'prefer-destructuring': 'off',
        'arrow-parens': ['error', 'as-needed'],
        // Do not care about dangling comma presence
        'comma-dangle': 'off',
        // // Do not care about operators linebreak
        'operator-linebreak': 'off',
        // // Do not care about arrow function linebreak
        'implicit-arrow-linebreak': 'off',
        // // Do not care about empty lines about props
        'lines-between-class-members': 'off',
        // This is not important rule
        'object-curly-newline': 'off',
        // // Styling rule which doesn't add anything
        'no-multiple-empty-lines': 'off',
        // This rule doesn't make sense in the latest browsers
        radix: 'off',
        // This serves no practical purpose
        'eol-last': 'off',

        // the base rule can report incorrect errors
        'no-useless-constructor': 'off',

        // Typescript Rules
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],

        // React Rules
        'react/prop-types': 'off',
        'react/display-name': 'off',

        // TSDoc
        'tsdoc/syntax': 'warn'
    },
    overrides: [
        {
            // enable the rule specifically for TypeScript files
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'off', overrides: { properties: 'explicit' } }]
            }
        }
    ]
};
