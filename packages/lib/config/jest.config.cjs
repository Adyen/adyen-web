module.exports = {
    testEnvironment: 'jest-fixed-jsdom',
    verbose: true,
    rootDir: '../',
    setupFilesAfterEnv: ['<rootDir>/config/setupTests.ts'],
    transformIgnorePatterns: ['node_modules/(?!(preact|@testing-library|until-async|@open-draft|rettime|msw)/)'],
    transform: {
        '^.+\\.(js|ts|tsx)$': 'ts-jest',
        '^.+\\.mjs$': '<rootDir>/config/esbuild-jest-transformer.cjs',
    },
    moduleNameMapper: {
        '\\.scss$': '<rootDir>/config/testMocks/styleMock.js'
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.stories.{ts,tsx}', '!/stories/', '!src/**/types.ts', '!src/language/locales/**'],
    coveragePathIgnorePatterns: ['node_modules/', 'config/', 'scripts/', 'storybook/', '.storybook/', '/stories/', 'auto/', '_']
};
