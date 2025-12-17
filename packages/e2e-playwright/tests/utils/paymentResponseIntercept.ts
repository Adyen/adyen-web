import { expect, Page } from '@playwright/test';

type PaymentActionType = 'redirect' | 'qrCode';

interface InterceptOptions {
    page: Page;
    expectedActionType: PaymentActionType;
    urlPattern?: string;
}

/**
 * Intercepts the payment response, validates the action type, and forwards the response.
 * Useful for verifying backend responses before they reach the component.
 *
 * @param options.page - Playwright page object
 * @param options.expectedActionType - Expected action type ('redirect' or 'qrCode')
 * @param options.urlPattern - URL pattern to intercept (defaults to payments endpoint)
 */
const DEFAULT_URL_PATTERN = '**/payments';

export async function interceptAndValidatePaymentResponse({
    page,
    expectedActionType,
    urlPattern = DEFAULT_URL_PATTERN
}: InterceptOptions): Promise<void> {
    await page.route(urlPattern, async route => {
        const response = await route.fetch();
        const responseBody = await response.json();

        expect(responseBody).toHaveProperty('action');
        expect(responseBody.action.type).toBe(expectedActionType);

        await route.fulfill({ response });
    });
}
