import { Page } from '@playwright/test';

const SESSION_URL = 'http://localhost:3024/sessions';

const sessionsMock = async (page: Page, mockedResponse: any): Promise<void> => {
    await page.route(SESSION_URL, (route, request) => {
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

export { sessionsMock };
