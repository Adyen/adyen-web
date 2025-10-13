// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import testingLibrary from 'eslint-plugin-testing-library';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import globals from 'globals';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = tseslint.config(
    {
        name: 'Global ignore',
        ignores: [
            'storybook-static/*',
            'coverage/*',
            'scripts/*',
            'dist/*',
            'config/*',
            'auto/*',
            'postcss.config.cjs',
            'eslint.config.js',
            '**/*_*.*'
        ]
    },
    eslint.configs.recommended,
    jsxA11y.flatConfigs.strict,
    reactRecommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        name: 'Custom rules',
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest
            },
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: __dirname
            }
        },
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'preact/compat',
                            importNames: ['forwardRef'],
                            message: 'forwardRef might lead to unexpected behaviors in preact/compat.'
                        }
                    ]
                }
            ],

            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-ignore': 'allow-with-description'
                }
            ],
            '@typescript-eslint/no-misused-promises': [
                'error',
                {
                    checksVoidReturn: {
                        attributes: false
                    }
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
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off'
        }
    },
    {
        name: 'Storybook story rules',
        files: ['**/?(*.)+(stories).[jt]s?(x)'],
        rules: {
            '@typescript-eslint/no-misused-promises': 'off'
        }
    },
    {
        name: 'Testing files rules',
        files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
        plugins: {
            'testing-library': testingLibrary
        },
        {
            name: 'Testing files rules',
            files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
            plugins: {
                'testing-library': testingLibrary
            },
            ...testingLibrary.configs['flat/dom'],
            ...testingLibrary.configs['flat/react']
        }
    }
);

export default config;
