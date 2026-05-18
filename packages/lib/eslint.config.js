// @ts-check

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import testingLibrary from 'eslint-plugin-testing-library';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import globals from 'globals';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = defineConfig(
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
            'lint-staged.config.js',
            '**/*_*.*'
        ]
    },
    js.configs.recommended,
    jsxA11y.flatConfigs.strict,
    reactRecommended,
    tseslint.configs.recommendedTypeChecked,
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
                    varsIgnorePattern: '^h$',
                    argsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/no-empty-function': [
                'error',
                {
                    allow: ['arrowFunctions']
                }
            ],
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/prefer-read-only-props': 'error',
            '@typescript-eslint/prefer-includes': 'error'
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
        rules: {
            ...testingLibrary.configs['flat/dom'].rules,
            ...testingLibrary.configs['flat/react'].rules
        }
    },
    // ══════════════════════════════════════════════════════════
    // Below it is listed folders/files with known Linting violations.
    // New code NOT listed here is automatically scanned.
    // Remove entries as the migration to Strict TypeScript progresses.
    // ══════════════════════════════════════════════════════════
    {
        name: 'Strict TypeScript rules',
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        ignores: [
            // ── Test files ──
            'src/**/*.test.ts',
            'src/**/*.test.tsx',
            'src/**/*.spec.ts',
            'src/**/*.spec.tsx',

            // ── Components
            'src/components/ANCV/**',
            'src/components/Dropin/**',
            'src/components/Giftcard/**',
            'src/components/Klarna/**',
            'src/components/PayTo/**',
            'src/components/ThreeDS2/**',

            // ── Internal Components ──
            'src/components/internal/Address/**',
            'src/components/internal/BaseElement/**',
            'src/components/internal/ClickToPay/**',
            'src/components/internal/FormFields/**',
            'src/components/internal/IbanInput/**',
            'src/components/internal/IssuerList/**',
            'src/components/internal/OpenInvoice/**',
            'src/components/internal/UIElement/**',

            // ── Utils ──
            'src/utils/useForm/**',

            // ── Others ──
            'src/core/**',
            'src/types/**'
        ],
        rules: {
            '@typescript-eslint/no-explicit-any': 'error'
        }
    },
    {
        name: 'Disable no-unused-vars for specific files',
        files: [
            'src/components/Ach/components/useSRPanelForACHErrors.ts',
            'src/components/ApplePay/ApplePay.tsx',
            'src/components/Card/components/CardInput/useSRPanelForCardInputErrors.ts',
            'src/components/Giftcard/components/useSRPanelForGiftcardErrors.ts',
            'src/components/Klarna/components/KlarnaWidget/KlarnaWidget.tsx',
            'src/components/PayByBankPix/PayByBankPix.tsx',
            'src/components/PayByBankPix/services/PasskeyService.ts',
            'src/components/ThreeDS2/components/utils.ts',
            'src/components/internal/Alert/Alert.tsx',
            'src/components/internal/OpenInvoice/useSRPanelForOpenInvoiceErrors.ts',
            'src/components/internal/SecuredFields/lib/CSF/initCSF.ts',
            'src/components/internal/SecuredFields/lib/securedField/SecuredField.ts',
            'src/utils/Storage.ts',
            'src/utils/amount-util.ts',
            'src/utils/base64.ts',
            'src/utils/clipboard.ts',
            'src/utils/detectInIframe.ts',
            'src/utils/detectInIframeInSameOrigin.ts',
            'src/utils/get-process-message-handler.ts',
            'src/utils/isValidURL.ts',
            'storybook/stories/PaypalReviewPage.stories.tsx',
            'storybook/stories/demos/SessionPatching/ComponentsDemo.tsx',
            'storybook/stories/demos/SessionPatching/DropinDemo.tsx'
        ],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off'
        }
    },
    {
        name: 'Disable prefer-promise-reject-errors for specific files',
        files: [
            'src/components/ApplePay/ApplePay.tsx',
            'src/components/ApplePay/services/ApplePaySdkLoader.ts',
            'src/components/ClickToPay/ClickToPay.tsx',
            'src/components/Dropin/elements/filters.test.ts',
            'src/components/GooglePay/GooglePay.tsx',
            'src/components/PayByBankPix/PayByBankPix.tsx',
            'src/components/PayPalFastlane/Fastlane.tsx',
            'src/components/internal/ClickToPay/services/ClickToPayService.ts',
            'src/components/internal/SecuredFields/lib/CSF/extensions/createSecuredFields.ts',
            'src/components/internal/UIElement/UIElement.tsx',
            'src/components/internal/UIElement/utils.ts',
            'src/core/core.ts',
            'src/utils/Script.ts',
            'src/utils/promiseTimeout.test.ts',
            'src/utils/promiseTimeout.ts'
        ],
        rules: {
            '@typescript-eslint/prefer-promise-reject-errors': 'off'
        }
    },
    {
        name: 'Disable no-empty-object-type for specific files',
        files: [
            'src/components/Card/components/CardInput/components/types.ts',
            'src/components/CustomCard/CustomCardInput/CustomCardInput.tsx',
            'src/components/PayByBankPix/PayByBankPix.tsx',
            'src/components/PayPalFastlane/stories/Fastlane.stories.tsx',
            'src/components/PayPalFastlane/types.ts',
            'src/components/PersonalDetails/PersonalDetails.tsx',
            'src/components/Sepa/types.ts',
            'src/components/internal/Address/types.ts',
            'src/components/internal/DetailsTable/DetailsTable.tsx',
            'src/components/internal/SegmentedControl/SegmentedControl.tsx',
            'storybook/stories/demos/SessionPatching/SessionPatching.stories.tsx',
            'storybook/types.ts'
        ],
        rules: {
            '@typescript-eslint/no-empty-object-type': 'off'
        }
    },
    {
        name: 'Disable no-unsafe-function-type for specific files',
        files: [
            'src/components/CashAppPay/components/CashAppComponent.tsx',
            'src/components/CashAppPay/services/CashAppService.test.ts',
            'src/components/CashAppPay/services/CashAppService.ts',
            'src/components/CashAppPay/services/types.ts',
            'src/components/internal/RedirectButton/RedirectButton.tsx',
            'src/utils/debounce.ts',
            'src/utils/get-process-message-handler.ts',
            'src/utils/useForm/types.ts',
            'src/utils/useForm/useForm.ts'
        ],
        rules: {
            '@typescript-eslint/no-unsafe-function-type': 'off'
        }
    },
    {
        name: 'Disable only-throw-error for specific files',
        files: ['src/components/AmazonPay/AmazonPay.tsx'],
        rules: {
            '@typescript-eslint/only-throw-error': 'off'
        }
    },
    {
        name: 'Disable no-unused-expressions for specific files',
        files: [
            'src/components/Card/components/CardInput/handlers.ts',
            'src/components/internal/ClickToPay/services/sdks/MastercardSdk.test.ts',
            'src/components/internal/ClickToPay/services/sdks/VisaSdk.test.ts',
            'src/components/internal/FormFields/Select/Select.tsx'
        ],
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off'
        }
    },
    {
        name: 'Disable no-useless-assignment for specific files',
        files: [
            'src/components/Card/components/Fastlane/utils/validate-configuration.ts',
            'src/components/internal/ClickToPay/services/create-clicktopay-service.test.ts',
            'src/components/internal/SecuredFields/binLookup/extensions.ts',
            'src/components/internal/SecuredFields/lib/CSF/utils/cardType.ts'
        ],
        rules: {
            'no-useless-assignment': 'off'
        }
    },
    {
        name: 'Disable no-base-to-string for specific files',
        files: ['src/components/PayPal/Paypal.tsx', 'src/components/internal/Countdown/CountdownA11yReporter.ts'],
        rules: {
            '@typescript-eslint/no-base-to-string': 'off'
        }
    },
    {
        name: 'Disable no-misused-promises for specific files',
        files: ['src/components/Redirect/types.ts'],
        rules: {
            '@typescript-eslint/no-misused-promises': 'off'
        }
    }
);

export default config;
