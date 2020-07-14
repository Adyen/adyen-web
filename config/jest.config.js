module.exports = {
    transformIgnorePatterns: ['node_modules'],
    transform: {
        '^.+\\.ts?$': 'ts-jest',
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.js?$': 'ts-jest'
    },
    verbose: false,
    globals: {
        NODE_ENV: 'test'
    },
    coveragePathIgnorePatterns: ['node_modules/', 'config/'],
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
    testPathIgnorePatterns: ['node_modules'],
    testURL: 'https://localhost:3030'
};

// Top all tests
/*module.exports.rootDir = '../';
module.exports.moduleNameMapper = {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/config/testMocks/fileMock.js',
    '\\.css$': '<rootDir>/config/testMocks/styleMock.js',
    '\\.scss$': '<rootDir>/config/testMocks/styleMock.js',
    '~(.*)$': '<rootDir>/src$1'
};
module.exports.setupFilesAfterEnv = ['<rootDir>/config/setupTests.js'];*/

// Run SecuredFields test only
/*module.exports.rootDir = '../src/components/internal/SecuredFields/';
module.exports.moduleNameMapper = {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>../../../../config/testMocks/fileMock.js',
    '\\.css$': '<rootDir>../../../../config/testMocks/styleMock.js',
    '\\.scss$': '<rootDir>../../../../config/testMocks/styleMock.js',
    '~(.*)$': '<rootDir>../../../../src$1'
};
module.exports.setupFilesAfterEnv = ['<rootDir>../../../../config/setupTests.js'];*/

// Run Card tests only
module.exports.rootDir = '../src/components/Card/';
module.exports.moduleNameMapper = {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>../../../config/testMocks/fileMock.js',
    '\\.css$': '<rootDir>../../../config/testMocks/styleMock.js',
    '\\.scss$': '<rootDir>../../../config/testMocks/styleMock.js',
    '~(.*)$': '<rootDir>../../../src$1'
};
module.exports.setupFilesAfterEnv = ['<rootDir>../../../config/setupTests.js'];
