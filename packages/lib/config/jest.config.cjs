module.exports = {
    testEnvironment: 'jest-fixed-jsdom',
    verbose: true,
    rootDir: '../',
    setupFilesAfterEnv: ['<rootDir>/config/setupTests.ts'],
    transformIgnorePatterns: ['node_modules/(?!(preact|@testing-library)/)'],
    transform: {
        '^.+\\.(js|ts|tsx|mjs)$': 'ts-jest'
    },
    moduleNameMapper: {
        '\\.scss$': '<rootDir>/config/testMocks/styleMock.js'
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.stories.{ts,tsx}','!src/**/types.ts', '!src/language/locales/**'],
    coveragePathIgnorePatterns: ['node_modules/', 'config/', 'scripts/', 'storybook/', '.storybook/', '/stories/', 'auto/', '_']
};
