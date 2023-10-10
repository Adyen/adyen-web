import { Page } from '@playwright/test';

const STATUS_URL = 'https://checkoutshopper-*.adyen.com/checkoutshopper/services/PaymentInitiation/v1/status?*';
const statusMock = async (page: Page, mockedResponse: any): Promise<void> => {
    await page.route(STATUS_URL, (route, request) => {
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

export { statusMock };
