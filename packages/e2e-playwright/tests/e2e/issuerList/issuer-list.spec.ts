import { test, expect } from '../../../pages/issuerList/issuer-list.fixture';

test.describe('Issuer List', () => {
    test('should select highlighted issuer, update pay button label, and see the expected data in state', async ({ issuerListPage }) => {
        const { issuerList, page } = issuerListPage;

        await issuerList.selectHighlightedIssuer('BLIK');
        await expect(issuerList.submitButton).toHaveText('Continue to BLIK');

        await issuerList.selectHighlightedIssuer('Idea Cloud');
        await expect(issuerList.submitButton).toHaveText('Continue to Idea Cloud');

        await expect(issuerList.highlightedIssuerButtonGroup.getByRole('button', { pressed: true })).toHaveText('Idea Cloud');

        let issuerListData = await page.evaluate('window.dotpay.data');

        // @ts-ignore
        expect(issuerListData.paymentMethod).toEqual({
            type: 'dotpay',
            issuer: '81',
            checkoutAttemptId: 'do-not-track'
        });
        //todo: add a step to pay
    });
});
