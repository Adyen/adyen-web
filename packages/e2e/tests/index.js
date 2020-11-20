const createTestCafe = require('testcafe');

const PATH = 'tests/';

(async () => {
    const testcafe = await createTestCafe();

    try {
        const runner = testcafe.createRunner();

        const failedCount = await runner
            .src(`${PATH}**/*.test.js`)
            .browsers('chrome:headless')
            .run();

        console.log('Number failed tests:', failedCount);
    } finally {
        await testcafe.close();
    }
})();
