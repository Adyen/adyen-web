import { Page } from '@playwright/test';

const PAYMENT_METHOD_BALANCE_URL = 'https://checkoutshopper-*.adyen.com/checkoutshopper/v1/sessions/*/paymentMethodBalance?*';

const paymentMethodBalanceMock = async (page: Page, mockedResponse: object, status = 200): Promise<void> => {
    await page.route(PAYMENT_METHOD_BALANCE_URL, async route => {
        await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify(mockedResponse),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    });
};

const removePaymentMethodBalanceMock = async (page: Page): Promise<void> => {
    await page.unroute(PAYMENT_METHOD_BALANCE_URL);
};

export { paymentMethodBalanceMock, removePaymentMethodBalanceMock };
