// Run all tests
const pathToRootDir = '../';
const pathToFileMock = '/config/testMocks/fileMock.js';
const pathToStyleMock = '/config/testMocks/styleMock.js';
const pathToFileSrc$1 = '/src$1';
const pathToSetupTests = '/config/setupTests.js';

// Run SecuredFields test only
//const pathToRootDir = '../src/components/internal/SecuredFields/';
//const pathToFileMock = '../../../../config/testMocks/fileMock.js';
//const pathToStyleMock = '../../../../config/testMocks/styleMock.js';
//const pathToFileSrc$1 = '../../../../src$1';
//const pathToSetupTests = '../../../../config/setupTests.js';

// Run Card tests only
//const pathToRootDir = '../src/components/Card/';
//const pathToFileMock = '../../../config/testMocks/fileMock.js';
//const pathToStyleMock = '../../../config/testMocks/styleMock.js';
//const pathToFileSrc$1 = '../../../src$1';
//const pathToSetupTests = '../../../config/setupTests.js';

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
    testURL: 'https://localhost:3030',
    rootDir: pathToRootDir,
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': `<rootDir>${pathToFileMock}`,
        '\\.css$': `<rootDir>${pathToStyleMock}`,
        '\\.scss$': `<rootDir>${pathToStyleMock}`,
        '~(.*)$': `<rootDir>${pathToFileSrc$1}`
    },
    setupFilesAfterEnv: [`<rootDir>${pathToSetupTests}`]
};
