const createTestCafe = require('testcafe');

const PATH = 'tests/e2e/';

(async () => {
    const testcafe = await createTestCafe();

    try {
        const runner = testcafe.createRunner();

        const failedCount = await runner
            .src([`${PATH}cards/KCP_iframes_noKCPAtStart.js`, `${PATH}cards/KCP_iframes_withKCPAtStart.js`])
            .browsers('chrome:headless')
            .run();

        console.log('Number failed tests:', failedCount);
    } finally {
        await testcafe.close();
    }
})();
