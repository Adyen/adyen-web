// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const config = tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    { files: ['src/**/*.ts', 'src/**/*.tsx'], ignores: ['dist/', 'config/'] },
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    }
);

console.log(config);

export default config;
