// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import _import from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';

const config = tseslint.config(
    { ignores: ['dist/*', 'config/*', 'auto/*', 'postcss.config.cjs'] },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            import: _import,
            'jsx-a11y': jsxA11y,
            react: react
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest
            },

            parserOptions: {
                ecmaFeatures: {
                    modules: true,
                    jsx: true
                }
            }
        },

        settings: {
            react: {
                pragma: 'h'
            },

            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx']
                }
            }
        },
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    name: 'preact/compat',
                    message: 'preact/compat should be used to leverage a React app to start using Preact, which it is not the case for adyen-web SDK.'
                }
            ],

            'no-console': 0,
            'class-methods-use-this': 'off',
            'no-underscore-dangle': 'off',
            'import/prefer-default-export': 'off',
            'no-debugger': 'warn',
            indent: 'off',

            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: true
                }
            ],

            'max-len': [
                'error',
                {
                    code: 150,
                    tabWidth: 2,
                    ignoreComments: true,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true
                }
            ],

            'prefer-destructuring': 'off',
            'arrow-parens': ['error', 'as-needed'],
            'comma-dangle': 'off',
            'operator-linebreak': 'off',
            'implicit-arrow-linebreak': 'off',
            'lines-between-class-members': 'off',
            'object-curly-newline': 'off',
            'no-multiple-empty-lines': 'off',
            radix: 'off',
            'eol-last': 'off',
            'no-useless-constructor': 'off',

            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/indent': 'off',
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-ignore': 'allow-with-description'
                }
            ],
            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                {
                    accessibility: 'off',
                    overrides: {
                        properties: 'explicit'
                    }
                }
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    ignoreRestSiblings: true,
                    vars: 'local',
                    varsIgnorePattern: '^h$'
                }
            ],
            '@typescript-eslint/no-empty-function': [
                'error',
                {
                    allow: ['arrowFunctions']
                }
            ],

            'react/prop-types': 'off',
            'react/display-name': 'off',

            'jsx-a11y/alt-text': 'error',
            'jsx-a11y/aria-role': 'error',
            'jsx-a11y/aria-props': 'error',
            'jsx-a11y/aria-unsupported-elements': 'error',
            'jsx-a11y/role-has-required-aria-props': 'error',
            'jsx-a11y/role-supports-aria-props': 'error',
            'jsx-a11y/tabindex-no-positive': 'error',
            'jsx-a11y/no-redundant-roles': 'error',
            'jsx-a11y/anchor-has-content': 'error',
            'jsx-a11y/anchor-is-valid': 'error',
            'jsx-a11y/img-redundant-alt': 'error',
            'jsx-a11y/interactive-supports-focus': 'error',
            'jsx-a11y/autocomplete-valid': 'error',
            'jsx-a11y/no-static-element-interactions': 'error',
            'jsx-a11y/no-noninteractive-tabindex': 'error',
            'jsx-a11y/mouse-events-have-key-events': 'error'
        }
    },
    {
        files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
        plugins: {
            'testing-library': testingLibrary
        }
    }
);

console.log(config);

export default config;
