import { test, expect } from '../../../fixtures/issuer-list.fixture';
import { pressEnter, pressKeyboardToNextItem } from '../../utils/keyboard';

test.describe('Issuer list - onlineBankingPL keyboard navigation', () => {
    test('it should be able to filter and select using the keyboard', async ({ page, onlineBankingPL }) => {
        await expect(onlineBankingPL.payButton).toHaveText('Continue');

        await onlineBankingPL.clickOnSelector();
        const issuers = await onlineBankingPL.issuers;
        expect(issuers.length).toBeGreaterThan(0);

        const [firstIssuer, secondIssuer] = issuers;
        await onlineBankingPL.typeOnSelectorField(firstIssuer); // filtered content
        await expect(onlineBankingPL.selectorList).not.toContainText(secondIssuer);

        // select one of the filtered option
        await pressKeyboardToNextItem(page); // Arrow down
        await pressEnter(page); // Enter key
        await expect(onlineBankingPL.payButton).toHaveText(`Continue to ${firstIssuer}`);

        // 1st press opens the dropdown
        await pressKeyboardToNextItem(page);
        // 2nd selects next item
        await pressKeyboardToNextItem(page);
        await pressEnter(page);

        await expect(onlineBankingPL.payButton).toHaveText(`Continue to ${secondIssuer}`);
    });

    test('it should load a default, from the filtered items, when pressing enter', async ({ page, onlineBankingPL }) => {
        await onlineBankingPL.clickOnSelector();
        const issuers = await onlineBankingPL.issuers;
        const [firstIssuer] = issuers;
        await onlineBankingPL.typeOnSelectorField(firstIssuer); // filtered content
        await pressEnter(page);

        await expect(onlineBankingPL.payButton).toHaveText(`Continue to ${firstIssuer}`);
    });

    test('it should have the expected data in state, ready for the /payments call', async ({ page, onlineBankingPL }) => {
        // Open the drop down and select an item
        await onlineBankingPL.clickOnSelector();
        await pressKeyboardToNextItem(page); // Arrow down
        await pressEnter(page); // Enter key

        let issuerListData = await page.evaluate('window.component.data');

        // @ts-ignore it can be flaky
        expect(issuerListData.paymentMethod).toMatchObject({
            type: 'onlineBanking_PL',
            issuer: '154'
        });
    });
});
