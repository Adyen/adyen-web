import { Page } from '@playwright/test';

const PAYMENTS_URL = 'https://checkoutshopper-*.adyen.com/checkoutshopper/v1/sessions/*/paymentDetails?*';
const paymentDetailsMock = async (page: Page, mockedResponse: any): Promise<void> => {
    await page.route(PAYMENTS_URL, (route, request) => {
        const requestData = JSON.parse(request.postData() || '');

        route.fulfill({
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

export { paymentDetailsMock };
