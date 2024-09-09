import { test, expect } from '../../pages/issuerList/issuer-list.fixture';
import { pressKeyboardToNextItem, pressEnter } from '../utils/keyboard';

test.describe('Issuer List', () => {
    test('it should be able to filter and select using the keyboard', async ({ issuerListPage }) => {
        const { issuerList, page } = issuerListPage;

        await expect(issuerList.submitButton).toHaveText('Continue');

        await issuerList.clickOnSelector();
        await expect(issuerList.selectorList).toContainText('mTransfer'); // full list

        await issuerList.typeOnSelectorField('Idea'); // filtered content
        await expect(issuerList.selectorList).not.toContainText('mTransfer');

        // select one of the filtered option
        await pressKeyboardToNextItem(page); // Arrow down
        await pressEnter(page); // Enter key

        await expect(issuerList.submitButton).toHaveText('Continue to Idea Cloud');

        // 1st press opens the dropdown
        await pressKeyboardToNextItem(page);
        // 2nd selects next item
        await pressKeyboardToNextItem(page);
        await pressEnter(page);

        await expect(issuerList.submitButton).toHaveText('Continue to mRaty');
    });

    test('it should load a default, from the filtered items, when pressing enter', async ({ issuerListPage }) => {
        const { issuerList, page } = issuerListPage;

        await issuerList.clickOnSelector();
        await issuerList.typeOnSelectorField('Nest');
        await pressEnter(page);

        await expect(issuerList.submitButton).toHaveText('Continue to Nest Bank');
    });

    // test('it should have the expected data in state, ready for the /payments call', async ({ issuerListPage }) => {
    //     const { issuerList, page } = issuerListPage;

    //     // Open the drop down and select an item
    //     await issuerList.clickOnSelector();
    //     await pressKeyboardToNextItem(page); // Arrow down
    //     await pressEnter(page); // Enter key

    //     let issuerListData = await page.evaluate('window.dotpay.data');

    //     // @ts-ignore
    //     expect(issuerListData.paymentMethod).toEqual({
    //         type: 'dotpay',
    //         issuer: '73',
    //         checkoutAttemptId: 'do-not-track'
    //     });
    // });

    // test('should select highlighted issuer, update pay button label, and see the expected data in state', async ({ issuerListPage }) => {
    //     const { issuerList, page } = issuerListPage;

    //     await issuerList.selectHighlightedIssuer('BLIK');
    //     await expect(issuerList.submitButton).toHaveText('Continue to BLIK');

    //     await issuerList.selectHighlightedIssuer('Idea Cloud');
    //     await expect(issuerList.submitButton).toHaveText('Continue to Idea Cloud');

    //     await expect(issuerList.highlightedIssuerButtonGroup.getByRole('button', { pressed: true })).toHaveText('Idea Cloud');

    //     let issuerListData = await page.evaluate('window.dotpay.data');

    //     // @ts-ignore
    //     expect(issuerListData.paymentMethod).toEqual({
    //         type: 'dotpay',
    //         issuer: '81',
    //         checkoutAttemptId: 'do-not-track'
    //     });
    // });
});
