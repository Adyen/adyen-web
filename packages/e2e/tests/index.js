const createTestCafe = require('testcafe');

const PATH = 'tests/';
const remote = process.argv.indexOf('--remote') > -1 || process.argv.indexOf('-r') > -1;

(async () => {
    const testcafe = await createTestCafe('localhost', 1337, 1338);

    try {
        const runner = testcafe.createRunner();
        let browser = 'chrome:headless';

        let d = new Date();

        if (remote) {
            const remoteConnection = await testcafe.createBrowserConnection();

            console.log(
                /* prettier-ignore */
                `Tests ready at - ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
            );
            console.log('\x1b[36m%s\x1b[0m', `${remoteConnection.url}`); // Outputs remoteConnection.url so that it can be visited from the remote browser.
            browser = remoteConnection;
        }
        const failedCount = await runner
            .src(`${PATH}**/*.test.js`)
            .browsers(browser)
            .run();

        d = new Date();
        /* prettier-ignore */
        console.log(`Tests completed at - ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`);
        console.log('Number failed tests:', failedCount);
    } finally {
        await testcafe.close();
    }
})();
