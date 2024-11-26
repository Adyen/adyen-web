import { Page } from '@playwright/test';

const PAYMENTS_URL = 'https://checkoutshopper-*.adyen.com/checkoutshopper/v1/sessions/*/payments?*';

const paymentsMock = async (page: Page, mockedResponse: any): Promise<void> => {
    await page.route(PAYMENTS_URL, async (route, request) => {
        const requestData = JSON.parse(request.postData() || '');

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                ...mockedResponse,
                requestId: requestData.requestId
            }),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    });
};

const paymentSuccessfulMock = async (page: Page) => {
    await page.route(PAYMENTS_URL, async route => {
        await route.fulfill({
            json: {
                resultCode: 'Authorised'
            }
        });
    });
};

export { paymentsMock, paymentSuccessfulMock };
