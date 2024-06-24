// @ts-check
import eslint from '@eslint/js';
import { fixupPluginRules } from '@eslint/compat';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import testingLibrary from 'eslint-plugin-testing-library';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import globals from 'globals';

const config = tseslint.config(
    { 
        name: 'Global ignore',
        ignores: ['coverage/*','dist/*', 'config/*', 'auto/*', 'postcss.config.cjs', '**/*_*/**'],
    },
    eslint.configs.recommended,
    jsxA11y.flatConfigs.strict,
    reactRecommended,
    ...tseslint.configs.recommended,
    {
        name: 'Custom rules',
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest
            },
        },
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    name: 'preact/compat',
                    message: 'preact/compat should be used to leverage a React app to start using Preact, which it is not the case for adyen-web SDK.'
                }
            ],

            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-types': 'off',
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

            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
        }
    },
    {
        name: 'Testing files rules',
        plugins: {
            'testing-library': fixupPluginRules({
				rules: testingLibrary.rules,
			}),
        },
        files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
        rules: {
            ...testingLibrary.configs.dom.rules,
            ...testingLibrary.configs.react.rules,
        }
    }
);


export default config;