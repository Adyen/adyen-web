import { createRequire } from 'node:module';
import path from 'node:path';
import { defineConfig } from 'jest';

/**
 * `@testing-library/preact` depends on `@testing-library/dom@^8`, while other dev dependencies (Storybook)
 * depend on `@testing-library/dom@^10`. When both are installed, the v10 copy is hoisted and the v8 copy is
 * nested inside `@testing-library/preact`, so `@testing-library/user-event` and `@testing-library/preact`
 * end up using two different instances.
 *
 * That breaks tests: `@testing-library/preact` registers its Preact `act()` event wrapper via `configure()`
 * on its own copy, so user-event never wraps events in `act()` and state updates are not flushed.
 *
 * Resolving from `@testing-library/preact` guarantees a single shared instance (and is a no-op when the
 * dependency is already deduplicated).
 */
const requireFrom = createRequire(import.meta.url);
const testingLibraryDom = path.dirname(
    path.dirname(requireFrom.resolve('@testing-library/dom', { paths: [path.dirname(requireFrom.resolve('@testing-library/preact'))] }))
);

export default defineConfig({
    testEnvironment: 'jest-fixed-jsdom',
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/config/setupTests.ts'],
    transformIgnorePatterns: ['node_modules/(?!(preact|@testing-library|until-async|@open-draft|rettime|msw)/)'],
    transform: {
        '^.+\\.(js|ts|tsx)$': 'ts-jest',
        '^.+\\.mjs$': '<rootDir>/config/esbuild-jest-transformer.cjs'
    },
    moduleNameMapper: {
        '\\.scss$': '<rootDir>/config/testMocks/styleMock.js',
        '^@testing-library/dom$': testingLibraryDom,
        '^@testing-library/dom/(.*)$': `${testingLibraryDom}/$1`
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.stories.{ts,tsx}', '!/stories/', '!src/**/types.ts', '!src/language/locales/**'],
    coveragePathIgnorePatterns: ['node_modules/', 'config/', 'scripts/', 'storybook/', '.storybook/', '/stories/', 'auto/', '_']
});
