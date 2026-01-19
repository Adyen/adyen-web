import { test, expect } from '../../../fixtures/issuer-list.fixture';

test.describe('Online banking PL', () => {
    test('should select highlighted issuer, update pay button label, and see the expected data in the payment request', async ({
        page,
        onlineBankingPL
    }) => {
        await onlineBankingPL.selectHighlightedIssuer('BLIK');
        await expect(onlineBankingPL.payButton).toHaveText('Continue to BLIK');

        await onlineBankingPL.selectHighlightedIssuer('e-transfer Pocztowy24');
        await expect(onlineBankingPL.payButton).toHaveText('Continue to e-transfer Pocztowy24');
        await expect(onlineBankingPL.highlightedIssuerButtonGroup.getByRole('button', { pressed: true })).toHaveText('e-transfer Pocztowy24');
        const requestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

        await onlineBankingPL.pay();
        const request = await requestPromise;

        expect(await request.postDataJSON().paymentMethod).toMatchObject({
            type: 'onlineBanking_PL',
            issuer: '141'
        });
    });
});
