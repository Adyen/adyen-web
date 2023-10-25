import { test, expect } from '../../pages/issuerList/issuer-list.fixture';

test.describe('Issuer List', () => {
    test('should select highlighted issuer and update pay button label', async ({ issuerListPage }) => {
        const { issuerList } = issuerListPage;

        await issuerList.selectHighlightedIssuer('Test Issuer 5');
        await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer 5');

        await issuerList.selectHighlightedIssuer('Test Issuer 4');
        await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer 4');

        await expect(issuerList.highlightedIssuerButtonGroup.getByRole('button', { pressed: true })).toHaveText('Test Issuer 4');
    });

    test('it should be able to filter and select using the keyboard', async ({ issuerListPage }) => {
        const { issuerList } = issuerListPage;

        await expect(issuerList.submitButton).toHaveText('Continue');

        await issuerList.clickOnSelector();
        await expect(issuerList.selectorList).toContainText('SNS');

        await issuerList.typeOnSelectorField('Test');
        await expect(issuerList.selectorList).not.toContainText('SNS');

        await issuerList.pressKeyboardToNextItem();
        await issuerList.pressKeyboardToNextItem();
        await issuerList.pressKeyboardToSelectItem();

        await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer 5');

        // 1st press opens the dropdown
        await issuerList.pressKeyboardToNextItem();
        // 2nd selects next items
        await issuerList.pressKeyboardToNextItem();
        await issuerList.pressKeyboardToSelectItem();

        await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer 4');
    });

    test('it should load a default when pressing enter', async ({ issuerListPage }) => {
        const { issuerList } = issuerListPage;

        await issuerList.clickOnSelector();
        await issuerList.typeOnSelectorField('Test');
        await issuerList.pressKeyboardToSelectItem();

        await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer');
    });
});
