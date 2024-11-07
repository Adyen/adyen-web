import { mergeTests, expect } from '@playwright/test';
import { test as cardWithAvs } from '../../../fixtures/card.fixture';
import { test as srPanel } from '../../../fixtures/srPanel.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';

const test = mergeTests(cardWithAvs, srPanel);
// Card with AVS, show srPanel, no prefilled data
const url = '/iframe.html?args=srConfig.showPanel:!true;componentConfiguration.data:!undefined&globals=&id=cards-card--with-avs&viewMode=story';

test('#1 avsCard error fields and inputs should have correct aria attributes', async ({ cardWithAvs }) => {
    await cardWithAvs.goto(url);
    await cardWithAvs.pay();
    await expect(cardWithAvs.cvcErrorElement).toHaveAttribute('aria-hidden', 'true');
    await expect(cardWithAvs.cvcErrorElement).not.toHaveAttribute('aria-live');
    await expect(cardWithAvs.cardNumberInput).toHaveAttribute('aria-describedby', /^adyen-checkout-encryptedCardNumber.*ariaContext$/);
    await expect(cardWithAvs.billingAddress.streetInput).toHaveAttribute('aria-describedby', /^adyen-checkout-street.*ariaError$/);
    await expect(cardWithAvs.billingAddress.streetInputError).not.toHaveAttribute('aria-describedby', /^adyen-checkout-street.*ariaError$/);
});

test('#2 Click pay with empty fields and error panel in avsCard is populated', async ({ page, cardWithAvs, srPanel }) => {
    const expectedSRPanelTexts = [
        'Enter the card number-sr',
        'Enter the expiry date-sr',
        'Enter the security code-sr',
        'Enter the Country/Region-sr',
        'Enter the Street-sr',
        'Enter the House number-sr',
        'Enter the Postal code-sr',
        'Enter the City-sr'
    ];
    await cardWithAvs.goto(url);
    await cardWithAvs.pay();
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
});

test('#3 fill out credit card fields & see that first error in error panel is country related', async ({ page, cardWithAvs, srPanel }) => {
    const expectedSRPanelTexts = [
        'Enter the Country/Region-sr',
        'Enter the Street-sr',
        'Enter the House number-sr',
        'Enter the Postal code-sr',
        'Enter the City-sr'
    ];
    await cardWithAvs.goto(url);
    await cardWithAvs.fillCardNumber(REGULAR_TEST_CARD);
    await cardWithAvs.fillExpiryDate(TEST_DATE_VALUE);
    await cardWithAvs.fillCvc(TEST_CVC_VALUE);

    await cardWithAvs.pay();
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
});

test('#4 Switch country to US, click pay with empty fields and error panel in avsCard is populated US style', async ({
    page,
    cardWithAvs,
    srPanel
}) => {
    const expectedSRPanelTexts = [
        'Enter the card number-sr',
        'Enter the expiry date-sr',
        'Enter the security code-sr',
        'Enter the Address-sr',
        'Enter the City-sr',
        'Enter the State-sr',
        'Enter the Zip code-sr'
    ];

    await cardWithAvs.goto(url);
    await cardWithAvs.billingAddress.selectCountry({ name: 'United States' });
    await cardWithAvs.pay();
    // Wait for all sr panel messages
    await page.waitForFunction(
        expectedLength => [...document.querySelectorAll('.adyen-checkout-sr-panel__msg')].map(el => el.textContent).length === expectedLength,
        expectedSRPanelTexts.length
    );
    const srErrorMessages = await srPanel.allMessages;
    srErrorMessages.forEach((retrievedText, index) => {
        expect(retrievedText).toHaveText(expectedSRPanelTexts[index]);
    });
});

test('#5 Switch country to US, fill out credit card fields & see that first error in error panel is address related', async ({
    page,
    cardWithAvs,
    srPanel
}) => {
    const expectedSRPanelTexts = ['Enter the Address-sr', 'Enter the City-sr', 'Enter the State-sr', 'Enter the Zip code-sr'];

    await cardWithAvs.goto(url);
    await cardWithAvs.fillCardNumber(REGULAR_TEST_CARD);
    await cardWithAvs.fillExpiryDate(TEST_DATE_VALUE);
    await cardWithAvs.fillCvc(TEST_CVC_VALUE);
    await cardWithAvs.billingAddress.selectCountry({ name: 'United States' });
    await cardWithAvs.pay();
    // Wait for all sr panel messages
    await page.waitForFunction(
        expectedLength => [...document.querySelectorAll('.adyen-checkout-sr-panel__msg')].map(el => el.textContent).length === expectedLength,
        expectedSRPanelTexts.length
    );
    const srErrorMessages = await srPanel.allMessages;
    srErrorMessages.forEach((retrievedText, index) => {
        expect(retrievedText).toHaveText(expectedSRPanelTexts[index]);
    });
});

test('#6 Switch country to UK, click pay with empty fields and error panel in avsCard is populated UK style', async ({
    page,
    cardWithAvs,
    srPanel
}) => {
    const expectedSRPanelTexts = [
        'Enter the card number-sr',
        'Enter the expiry date-sr',
        'Enter the security code-sr',
        'Enter the House number-sr',
        'Enter the Street-sr',
        'Enter the City / Town-sr',
        'Enter the Postal code-sr'
    ];

    await cardWithAvs.goto(url);
    await cardWithAvs.billingAddress.selectCountry({ name: 'United Kingdom' });
    await cardWithAvs.pay();
    // Wait for all sr panel messages
    await page.waitForFunction(
        expectedLength => [...document.querySelectorAll('.adyen-checkout-sr-panel__msg')].map(el => el.textContent).length === expectedLength,
        expectedSRPanelTexts.length
    );
    const srErrorMessages = await srPanel.allMessages;
    srErrorMessages.forEach((retrievedText, index) => {
        expect(retrievedText).toHaveText(expectedSRPanelTexts[index]);
    });
});

test('#7 Switch country to UK, fill out credit card fields & see that first error in error panel is address related', async ({
    page,
    cardWithAvs,
    srPanel
}) => {
    const expectedSRPanelTexts = ['Enter the House number-sr', 'Enter the Street-sr', 'Enter the City / Town-sr', 'Enter the Postal code-sr'];

    await cardWithAvs.goto(url);
    await cardWithAvs.fillCardNumber(REGULAR_TEST_CARD);
    await cardWithAvs.fillExpiryDate(TEST_DATE_VALUE);
    await cardWithAvs.fillCvc(TEST_CVC_VALUE);
    await cardWithAvs.billingAddress.selectCountry({ name: 'United Kingdom' });
    await cardWithAvs.pay();
    // Wait for all sr panel messages
    await page.waitForFunction(
        expectedLength => [...document.querySelectorAll('.adyen-checkout-sr-panel__msg')].map(el => el.textContent).length === expectedLength,
        expectedSRPanelTexts.length
    );
    const srErrorMessages = await srPanel.allMessages;
    srErrorMessages.forEach((retrievedText, index) => {
        expect(retrievedText).toHaveText(expectedSRPanelTexts[index]);
    });
});
