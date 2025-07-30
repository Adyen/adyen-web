import { test as base, expect } from '@playwright/test';
import http from 'http';

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

            // Manually fetch the HTTP content
            const response: { status: number; body: string } = await new Promise((resolve, reject) => {
                http.get(newUrl, res => {
                    let body = '';
                    res.on('data', chunk => (body += chunk));
                    res.on('end', () => resolve({ status: res.statusCode, body }));
                }).on('error', reject);
            });

            await route.fulfill({
                status: response.status,
                body: response.body
            });
        });

        await use(page);
    }
});

export { test, expect };
