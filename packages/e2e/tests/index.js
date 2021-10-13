const createTestCafe = require('testcafe');

const PATH = 'tests/';
const remote = process.argv.indexOf('--remote') > -1 || process.argv.indexOf('-r') > -1;

(async () => {
    const testcafe = await createTestCafe('localhost', 1337, 1338);

    try {
        const runner = testcafe.createRunner();
        let browser = 'chrome:headless';

        if (remote) {
            const remoteConnection = await testcafe.createBrowserConnection();
            console.log('\x1b[36m%s\x1b[0m', `${remoteConnection.url}`); // Outputs remoteConnection.url so that it can be visited from the remote browser.
            browser = remoteConnection;
        }
        const failedCount = await runner
            .src(`${PATH}**/*.test.js`)
            .browsers(browser)
            .run();

        console.log('Number failed tests:', failedCount);
    } finally {
        await testcafe.close();
    }
})();
