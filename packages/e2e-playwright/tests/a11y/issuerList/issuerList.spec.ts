import { test, expect } from '../../../fixtures/issuerList/issuer-list.fixture';
import { pressEnter, pressKeyboardToNextItem } from '../../utils/keyboard';

test.describe('Issuer list keyboard navigation', () => {
    test('it should be able to filter and select using the keyboard', async ({ page, issuerListPage }) => {
        await expect(issuerListPage.submitButton).toHaveText('Continue');
        await issuerListPage.clickOnSelector();
        await expect(issuerListPage.selectorList).toContainText('mTransfer'); // full list

        await issuerListPage.typeOnSelectorField('Idea'); // filtered content
        await expect(issuerListPage.selectorList).not.toContainText('mTransfer');

        // select one of the filtered option
        await pressKeyboardToNextItem(page); // Arrow down
        await pressEnter(page); // Enter key

        await expect(issuerListPage.submitButton).toHaveText('Continue to Idea Cloud');

        // 1st press opens the dropdown
        await pressKeyboardToNextItem(page);
        // 2nd selects next item
        await pressKeyboardToNextItem(page);
        await pressEnter(page);

        await expect(issuerListPage.submitButton).toHaveText('Continue to mRaty');
    });

    test('it should load a default, from the filtered items, when pressing enter', async ({ page, issuerListPage }) => {
        await issuerListPage.clickOnSelector();
        await issuerListPage.typeOnSelectorField('Nest');
        await pressEnter(page);

        await expect(issuerListPage.submitButton).toHaveText('Continue to Nest Bank');
    });

    test('it should have the expected data in state, ready for the /payments call', async ({ page, issuerListPage }) => {
        // Open the drop down and select an item
        await issuerListPage.clickOnSelector();
        await pressKeyboardToNextItem(page); // Arrow down
        await pressEnter(page); // Enter key

        let issuerListData = await page.evaluate('window.component.data');

        // @ts-ignore
        expect(issuerListData.paymentMethod).toMatchObject({
            type: 'onlineBanking_PL',
            issuer: '73'
        });
    });
});
