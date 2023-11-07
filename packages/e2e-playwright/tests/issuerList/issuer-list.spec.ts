import { test, expect } from '../../pages/issuerList/issuer-list.fixture';
import { pressKeyboardToNextItem, pressKeyboardToSelectItem } from '../utils/keyboard';

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
        const { issuerList, page } = issuerListPage;

        await expect(issuerList.submitButton).toHaveText('Continue');

        await issuerList.clickOnSelector();
        await expect(issuerList.selectorList).toContainText('SNS');

        await issuerList.typeOnSelectorField('Test');
        await expect(issuerList.selectorList).not.toContainText('SNS');

        await pressKeyboardToNextItem(page);
        await pressKeyboardToNextItem(page);
        await pressKeyboardToSelectItem(page);

        await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer 5');

        // 1st press opens the dropdown
        await pressKeyboardToNextItem(page);
        // 2nd selects next items
        await pressKeyboardToNextItem(page);
        await pressKeyboardToSelectItem(page);

        await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer 4');
    });

    test('it should load a default when pressing enter', async ({ issuerListPage }) => {
        const { issuerList, page } = issuerListPage;

        await issuerList.clickOnSelector();
        await issuerList.typeOnSelectorField('Test');
        await pressKeyboardToSelectItem(page);

        await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer');
    });
});
