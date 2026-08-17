import { Page } from '@playwright/test';
import { EMI_PLANS_URL } from '../../tests/utils/constants';

/**
 * Stands in for the merchant backend call the stories make. The E2E Storybook build runs with MSW
 * disabled, so the plans are mocked here instead of through the story's own handlers.
 */
const emiPlansMock = async (page: Page, mockedResponse: unknown, status = 200): Promise<void> => {
    await page.route(EMI_PLANS_URL, route =>
        route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify(mockedResponse),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
    );
};

export { emiPlansMock };
