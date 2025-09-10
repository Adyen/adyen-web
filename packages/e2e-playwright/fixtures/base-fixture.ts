import { test as base, expect } from '@playwright/test';

const test = base.extend({
    /**
     * Intercept the requests to CDN, fetch the translations from the Express server, and send them back to the web app
     */
    page: async ({ page }, use) => {
        await page.route('https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/sdk/*/translations/*', async route => {
            const translationUrlPath = route.request().url().replace('https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/', '/');
            const currentPageUrl = route.request().frame().url();
            const origin = new URL(currentPageUrl).origin;
            const newUrl = `${origin}${translationUrlPath}`;

            const response = await page.request.fetch(newUrl, { ignoreHTTPSErrors: true }); // Playwright handles HTTP/HTTPS and certificate validation automatically
            await route.fulfill({ response });
        });

        await use(page);
    }
});

export { test, expect };
