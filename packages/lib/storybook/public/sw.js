let failCount = 0;

self.addEventListener('fetch', event => {
    const url = event.request.url;

    if (url.includes('apple-pay-sdk.js')) {
        console.log('apple pay sdk being loaded', failCount);
        failCount++;

        if (failCount <= 3) {
            console.log(`❌ Simulated failure #${failCount}`);
            event.respondWith(Promise.reject(new Error('Simulated failure')));
            return;
        }

        console.log('✅ Allowing real script load');
        failCount = 0;
        // do nothing → falls through to network
    }
});
