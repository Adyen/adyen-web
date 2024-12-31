import { mergeTests, expect } from '@playwright/test';
import { test as card } from '../../../fixtures/card.fixture';
import { test as srPanel } from '../../../fixtures/srPanel.fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { REGULAR_TEST_CARD } from '../../utils/constants';

const test = mergeTests(card, srPanel);

test('#1 Error panel is present at start, when there are no errors, but is empty', async ({ card, srPanel }) => {
    await card.goto(URL_MAP.cardWithVisibleSrPanel);
    expect(await srPanel.allMessages).toHaveLength(0);
});

test('#2 Click pay with empty fields and error panel is populated', async ({ card, srPanel, page, browserName }) => {
    const expectedSRPanelTexts = ['Enter the card number-sr', 'Enter the expiry date-sr', 'Enter the security code-sr'];
    await card.goto(URL_MAP.cardWithVisibleSrPanel);
    await card.pay();
    // Wait for all sr panel messages
    await page.waitForFunction(
        expectedLength => [...document.querySelectorAll('.adyen-checkout-sr-panel__msg')].map(el => el.textContent).length === expectedLength,
        expectedSRPanelTexts.length
    );
    // check individual messages
    const srErrorMessages = await srPanel.allMessages;
    srErrorMessages.forEach((retrievedText, index) => {
        expect(retrievedText).toHaveText(expectedSRPanelTexts[index]);
    });
    if (browserName !== 'firefox') {
        await expect(card.cardNumberInput).toBeFocused();
    } else {
        console.log('Skipping focus check for Firefox');
    }
});

test('#3 Fill out PAN & see that first error in error panel is date related', async ({ card, srPanel, page, browserName }) => {
    const expectedSRPanelTexts = ['Enter the expiry date-sr', 'Enter the security code-sr'];
    await card.goto(URL_MAP.cardWithVisibleSrPanel);
    await card.fillCardNumber(REGULAR_TEST_CARD);
    await card.pay();
    // Wait for all sr panel messages
    await page.waitForFunction(
        expectedLength => [...document.querySelectorAll('.adyen-checkout-sr-panel__msg')].map(el => el.textContent).length === expectedLength,
        expectedSRPanelTexts.length
    );
    // check individual messages
    const srErrorMessages = await srPanel.allMessages;
    srErrorMessages.forEach((retrievedText, index) => {
        expect(retrievedText).toHaveText(expectedSRPanelTexts[index]);
    });
    if (browserName !== 'firefox') {
        await expect(card.expiryDateInput).toBeFocused();
    } else {
        console.log('Skipping focus check for Firefox');
    }
});
