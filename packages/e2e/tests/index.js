const createTestCafe = require('testcafe');

const PATH = 'tests/';
const remote = process.argv.indexOf('--remote') > -1 || process.argv.indexOf('-r') > -1;

(async () => {
    const testcafe = await createTestCafe('localhost', 1337, 1338);

    const zeroPad = (value, length = 2) => {
        if (length === 0) return value;
        const strValue = String(value);
        return strValue.length >= length ? strValue : ('0'.repeat(length) + strValue).slice(length * -1);
    };

    try {
        const runner = testcafe.createRunner();
        let browser = 'chrome:headless';

        let d = new Date();

        if (remote) {
            const remoteConnection = await testcafe.createBrowserConnection();

            console.log(`Tests ready at - ${zeroPad(d.getHours())}:${zeroPad(d.getMinutes())}:${zeroPad(d.getSeconds())}`);
            console.log('\x1b[36m%s\x1b[0m', `${remoteConnection.url}`); // Outputs remoteConnection.url so that it can be visited from the remote browser.
            browser = remoteConnection;
        }
        const failedCount = await runner
            .src(`${PATH}**/*.test.js`)
            .browsers(browser)
            .run();

        d = new Date();
        console.log(`Tests completed at - ${zeroPad(d.getHours())}:${zeroPad(d.getMinutes())}:${zeroPad(d.getSeconds())}`);
        console.log('Number failed tests:', failedCount);
    } finally {
        await testcafe.close();
    }
})();
