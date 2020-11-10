const createTestCafe = require('testcafe');

(async () => {
    const testcafe = await createTestCafe();

    try {
        const runner = testcafe.createRunner();

        const failedCount = await runner
            .src(['tests/e2e/KCP_iframes_noKCPAtStart.js', 'tests/e2e/KCP_iframes_withKCPAtStart.js'])
            .browsers('chrome:headless')
            .run();

        console.log('Number failed tests:', failedCount);
    } finally {
        await testcafe.close();
    }
})();
