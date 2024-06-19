import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import testingLibrary from "eslint-plugin-testing-library";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/*_*.*", "**/dist/", "**/server/", "!**/.storybook"],
}, ...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:storybook/recommended",
)), {
    plugins: {
        react: fixupPluginRules(react),
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        import: fixupPluginRules(_import),
        "jsx-a11y": jsxA11Y,
        "testing-library": testingLibrary,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.jest,
        },

        parser: tsParser,
        ecmaVersion: 2018,
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                modules: true,
                jsx: true,
            },
        },
    },

    settings: {
        react: {
            pragma: "h",
            version: "16.0",
        },

        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },

    rules: {
        "no-restricted-imports": ["error", {
            name: "preact/compat",
            message: "preact/compat should be used to leverage a React app to start using Preact, which it is not the case for adyen-web SDK.",
        }],

        "no-console": 0,
        "class-methods-use-this": "off",
        "no-underscore-dangle": "off",
        "import/prefer-default-export": "off",
        "no-debugger": "warn",
        indent: "off",

        "import/no-extraneous-dependencies": ["error", {
            devDependencies: true,
        }],

        "max-len": ["error", {
            code: 150,
            tabWidth: 2,
            ignoreComments: true,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
        }],

        "prefer-destructuring": "off",
        "arrow-parens": ["error", "as-needed"],
        "comma-dangle": "off",
        "operator-linebreak": "off",
        "implicit-arrow-linebreak": "off",
        "lines-between-class-members": "off",
        "object-curly-newline": "off",
        "no-multiple-empty-lines": "off",
        radix: "off",
        "eol-last": "off",
        "no-useless-constructor": "off",

        "@typescript-eslint/no-unused-vars": ["error", {
            ignoreRestSiblings: true,
            vars: "local",
        }],

        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/indent": "off",

        "@typescript-eslint/no-empty-function": ["error", {
            allow: ["arrowFunctions"],
        }],

        "@typescript-eslint/ban-types": "off",

        "@typescript-eslint/ban-ts-comment": ["error", {
            "ts-ignore": "allow-with-description",
        }],

        "@typescript-eslint/explicit-module-boundary-types": "off",
        "react/prop-types": "off",
        "react/display-name": "off",
        "jsx-a11y/alt-text": "error",
        "jsx-a11y/aria-role": "error",
        "jsx-a11y/aria-props": "error",
        "jsx-a11y/aria-unsupported-elements": "error",
        "jsx-a11y/role-has-required-aria-props": "error",
        "jsx-a11y/role-supports-aria-props": "error",
        "jsx-a11y/tabindex-no-positive": "error",
        "jsx-a11y/no-redundant-roles": "error",
        "jsx-a11y/anchor-has-content": "error",
        "jsx-a11y/anchor-is-valid": "error",
        "jsx-a11y/img-redundant-alt": "error",
        "jsx-a11y/interactive-supports-focus": "error",
        "jsx-a11y/autocomplete-valid": "error",
        "jsx-a11y/no-static-element-interactions": "error",
        "jsx-a11y/no-noninteractive-tabindex": "error",
        "jsx-a11y/mouse-events-have-key-events": "error",
    },
}, {
    files: ["storybook/**/*.tsx"],

    rules: {
        "react/react-in-jsx-scope": "off",
    },
}, {
    files: ["**/*.ts", "**/*.tsx"],

    rules: {
        "@typescript-eslint/explicit-member-accessibility": ["error", {
            accessibility: "off",

            overrides: {
                properties: "explicit",
            },
        }],
    },
}, ...compat.extends("plugin:testing-library/react").map(config => ({
    ...config,
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
}))];