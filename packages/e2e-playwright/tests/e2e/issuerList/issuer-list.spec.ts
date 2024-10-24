import { test, expect } from '../../../fixtures/issuerList/issuer-list.fixture';

test.describe('Online banking PL', () => {
    test('should select highlighted issuer, update pay button label, and see the expected data in state', async ({ page, issuerListPage }) => {
        await issuerListPage.selectHighlightedIssuer('BLIK');
        await expect(issuerListPage.submitButton).toHaveText('Continue to BLIK');

        await issuerListPage.selectHighlightedIssuer('e-transfer Pocztowy24');
        await expect(issuerListPage.submitButton).toHaveText('Continue to e-transfer Pocztowy24');

        await expect(issuerListPage.highlightedIssuerButtonGroup.getByRole('button', { pressed: true })).toHaveText('e-transfer Pocztowy24');

        let issuerListData = await page.evaluate('window.component.data');

        // @ts-ignore
        expect(issuerListData.paymentMethod).toMatchObject({
            type: 'onlineBanking_PL',
            issuer: '141'
        });
    });
});
