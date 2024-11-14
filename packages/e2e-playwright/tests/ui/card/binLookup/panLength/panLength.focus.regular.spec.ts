import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { AMEX_CARD, CARD_WITH_PAN_LENGTH, MAESTRO_CARD, MULTI_LUHN_MAESTRO, REGULAR_TEST_CARD } from '../../../../utils/constants';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import {
    hiddenDateWithPanLengthMock,
    multiLengthMaestroWithPanLengthMock,
    amexWithPanLengthMock,
    optionalDateAndCvcWithPanLengthMock,
    optionalDateWithPanLengthMock
} from '../../../../../mocks/binLookup/binLookup.data';

test.describe('Test how Card Component handles binLookup returning a panLength property (or not)', () => {
    test("#1 Fill out PAN & see that focus stays on number field since binLookup doesn't return a panLength", async ({ card, page }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        // Check start state
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect focus to be still be on number field
        await expect(card.cardNumberLabelWithFocus).toBeVisible();
        await expect(card.expiryDateLabelWithFocus).not.toBeVisible();
    });

    test('#2 Fill out PAN(binLookup w. panLength), maxLength is set on cardNumber SF, and that focus moves to expiryDate', async ({ card, page }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(CARD_WITH_PAN_LENGTH);

        // Expect UI change - expiryDate field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.expiryDateLabelWithFocus).toBeVisible();

        // Expect iframe to exist in number field with maxlength attr set to 19
        let panInputMaxLength = await card.cardNumberInput.getAttribute('maxlength');
        expect(panInputMaxLength).toEqual('19');

        // Delete number and see that the maxlength is reset on the iframe
        await card.deleteCardNumber();
        panInputMaxLength = await card.cardNumberInput.getAttribute('maxlength');

        expect(panInputMaxLength).toEqual('24');
    });

    test('#3 Fill out PAN (binLookup w. panLength) see that focus moves to CVC since expiryDate is optional', async ({ card, page }) => {
        await binLookupMock(page, optionalDateWithPanLengthMock);

        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - cvc field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.cvcLabelWithFocus).toBeVisible();
    });

    test('#4 Fill out PAN (binLookup w. panLength) see that focus moves to CVC since expiryDate is hidden', async ({ card, page }) => {
        await binLookupMock(page, hiddenDateWithPanLengthMock);

        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - cvc field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.cvcLabelWithFocus).toBeVisible();
    });

    test('#5 Fill out PAN (binLookup w. panLength) see that focus moves to holderName since expiryDate & cvc are optional', async ({
        card,
        page
    }) => {
        await binLookupMock(page, optionalDateAndCvcWithPanLengthMock);

        const componentConfig = { hasHolderName: true, holderNameRequired: true };

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - holderName field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.holderNameLabelWithFocus).toBeVisible();
    });

    test('#6 Fill out invalid date on an optional date field, then fill PAN (binLookup w. panLength) see that focus moves to (optional) expiryDate since expiryDate is in error', async ({
        card,
        page
    }) => {
        await binLookupMock(page, optionalDateWithPanLengthMock);

        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        // Card out of date
        await card.fillExpiryDate('12/90');

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - expiryDate field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.expiryDateLabelWithFocus).toBeVisible();
    });

    test('#7 Fill out PAN by **pasting** number (binLookup w. panLength) & see that maxLength is set on number SF and that focus moves to expiryDate', async ({
        card,
        page
    }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        // Place focus on the input
        await card.cardNumberLabelElement.click();

        // Copy text to clipboard
        await page.evaluate(() => navigator.clipboard.writeText('4000620000000007')); // Can't use the constant for some reason

        // Paste text from clipboard
        await page.keyboard.press('Meta+V');

        // Expect UI change - expiryDate field has focus
        await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
        await expect(card.expiryDateLabelWithFocus).toBeVisible();
    });

    test(
        "#8 Fill out PAN with binLookup panLength of 18 and see that when you fill in the 16th digit the focus doesn't jump " +
            ' then complete the number to 18 digits and see the focus jump' +
            ' then delete the number and add an amex one and see the focus now jumps after 15 digits',
        async ({ card, page }) => {
            await binLookupMock(page, multiLengthMaestroWithPanLengthMock);

            await card.goto(URL_MAP.card);

            await card.isComponentVisible();

            const firstDigits = MULTI_LUHN_MAESTRO.substring(0, 16);
            const lastDigits = MULTI_LUHN_MAESTRO.substring(16, 18);

            // Type first part of PAN
            await card.typeCardNumber(firstDigits);

            // Expect focus to be still be on number field
            await expect(card.cardNumberLabelWithFocus).toBeVisible();
            await expect(card.expiryDateLabelWithFocus).not.toBeVisible();

            // Type remaining digits
            await card.typeCardNumber(lastDigits);

            // Expect UI change - expiryDate field has focus
            await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
            await expect(card.expiryDateLabelWithFocus).toBeVisible();

            // Delete number
            await card.deleteCardNumber();

            // Expect focus back on number field
            await expect(card.cardNumberLabelWithFocus).toBeVisible();
            await expect(card.expiryDateLabelWithFocus).not.toBeVisible();

            // Reset mock
            await binLookupMock(page, amexWithPanLengthMock);

            // Type new PAN that will give different /binLookup response
            await card.typeCardNumber(AMEX_CARD);

            // Expect UI change - expiryDate field has focus again
            await expect(card.cardNumberLabelWithFocus).not.toBeVisible();
            await expect(card.expiryDateLabelWithFocus).toBeVisible();
        }
    );

    test('#9 Fill out PAN with Visa num that binLookup says has a panLength of 16 - you should not then be able to type more digits in the card number field', async ({
        card,
        page
    }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(CARD_WITH_PAN_LENGTH);

        // Should not be able to add more digits to the PAN
        await card.cardNumberInput.press('End'); /** NOTE: how to add text at end */
        await card.typeCardNumber('6');

        // Confirm PAN value has not had chars added
        let val = await card.cardNumberInput.inputValue();
        expect(val).toEqual('4000 6200 0000 0007');
    });
});
