module.exports = {
    transformIgnorePatterns: ['node_modules'],
    transform: {
        '\\.[jt]sx?$': 'babel-jest',
        '^.+\\.ts?$': 'ts-jest',
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/config/testMocks/fileMock.js',
        '\\.css$': '<rootDir>/config/testMocks/styleMock.js',
        '\\.scss$': '<rootDir>/config/testMocks/styleMock.js',
        '~(.*)$': '<rootDir>/src$1'
    },
    verbose: true,
    testEnvironment: 'jsdom',
    globals: {
        NODE_ENV: 'test'
    },
    coveragePathIgnorePatterns: ['node_modules/', 'config/'],
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
    testPathIgnorePatterns: ['node_modules'],
    rootDir: '../',
    testEnvironmentOptions: {
        url: 'https://localhost:3030'
    },
    setupFilesAfterEnv: ['<rootDir>/config/setupTests.ts']
};
