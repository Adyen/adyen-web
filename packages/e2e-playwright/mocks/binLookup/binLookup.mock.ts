import { Page } from '@playwright/test';
import { BIN_LOOKUP_URL } from '../../tests/utils/constants';

const binLookupMock = async (page: Page, mockedResponse: any): Promise<void> => {
    await page.route(BIN_LOOKUP_URL, (route, request) => {
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

export { binLookupMock };
