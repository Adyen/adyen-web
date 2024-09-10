import { test, expect } from '../../pages/issuerList/issuer-list.fixture';
import { pressKeyboardToNextItem, pressKeyboardToSelectItem } from '../utils/keyboard';

test.describe('Issuer List', () => {
    // TODO - these tests are very conditional on the expected issuers being listed and in the existing order.
    //  if this proves problematic in the future, we should mock it
    test('it should be able to filter and select using the keyboard', async ({ issuerListPage }) => {
        const { issuerList, page } = issuerListPage;

        await expect(issuerList.submitButton).toHaveText('Continue');

        await issuerList.clickOnSelector();
        await expect(issuerList.selectorList).toContainText('Raiffeisen'); // full list

        await issuerList.typeOnSelectorField('Aktia'); // filtered content
        await expect(issuerList.selectorList).not.toContainText('Raiffeisen');

        // select one of the filtered option
        await pressKeyboardToNextItem(page); // Arrow down
        await pressKeyboardToSelectItem(page); // Enter key

        await expect(issuerList.submitButton).toHaveText('Continue to Aktia');

        // 1st press opens the dropdown
        await pressKeyboardToNextItem(page);
        // 2nd selects next item
        await pressKeyboardToNextItem(page);
        await pressKeyboardToSelectItem(page);

        await expect(issuerList.submitButton).toHaveText('Continue to AGBA');
    });

    test('it should load a default, from the filtered items, when pressing enter', async ({ issuerListPage }) => {
        const { issuerList, page } = issuerListPage;

        await issuerList.clickOnSelector();
        await issuerList.typeOnSelectorField('SEB');
        await pressKeyboardToSelectItem(page);

        await expect(issuerList.submitButton).toHaveText('Continue to SEB');
    });

    test('it should have the expected data in state, ready for the /payments call', async ({ issuerListPage }) => {
        const { issuerList, page } = issuerListPage;

        // Open the drop down and select an item
        await issuerList.clickOnSelector();
        await pressKeyboardToNextItem(page); // Arrow down
        await pressKeyboardToSelectItem(page); // Enter key

        let issuerListData = await page.evaluate('window.entercash.data');

        // @ts-ignore
        const { checkoutAttemptId, ...rest } = issuerListData.paymentMethod; // strip checkoutAttemptId since we can't know its value

        expect(rest).toEqual({
            type: 'entercash',
            issuer: '231'
        });
    });

    test('should select highlighted issuer, update pay button label, and see the expected data in state', async ({ issuerListPage }) => {
        const { issuerList, page } = issuerListPage;

        await issuerList.selectHighlightedIssuer('POP Pankki');
        await expect(issuerList.submitButton).toHaveText('Continue to POP Pankki');

        await issuerList.selectHighlightedIssuer('Aktia');
        await expect(issuerList.submitButton).toHaveText('Continue to Aktia');

        await expect(issuerList.highlightedIssuerButtonGroup.getByRole('button', { pressed: true })).toHaveText('Aktia');

        let issuerListData = await page.evaluate('window.entercash.data');

        // @ts-ignore
        const { checkoutAttemptId, ...rest } = issuerListData.paymentMethod; // strip checkoutAttemptId since we can't know its value

        expect(rest).toEqual({
            type: 'entercash',
            issuer: '232'
        });
    });
});
