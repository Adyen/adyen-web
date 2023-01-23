module.exports = {
    testEnvironment: 'jsdom',
    verbose: true,
    rootDir: '../',
    setupFilesAfterEnv: ['<rootDir>/config/setupTests.ts'],
    transformIgnorePatterns: ['node_modules/(?!(preact|@testing-library)/)'],
    transform: {
        '^.+\\.(js|ts|tsx|mjs)$': 'babel-jest'
    },
    moduleNameMapper: {
        '\\.scss$': '<rootDir>/config/testMocks/styleMock.js'
    },
    coveragePathIgnorePatterns: ['node_modules/', 'config/', 'scripts/']
};
