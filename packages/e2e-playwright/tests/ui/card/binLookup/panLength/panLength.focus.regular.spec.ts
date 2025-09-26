import { test, expect } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { AMEX_CARD, CARD_WITH_PAN_LENGTH, MULTI_LUHN_MAESTRO, REGULAR_TEST_CARD } from '../../../../utils/constants';
import { binLookupMock } from '../../../../../mocks/binLookup/binLookup.mock';
import {
    hiddenDateWithPanLengthMock,
    multiLengthMaestroWithPanLengthMock,
    amexWithPanLengthMock,
    optionalDateAndCvcWithPanLengthMock,
    optionalDateWithPanLengthMock
} from '../../../../../mocks/binLookup/binLookup.data';

test.describe('Test Card, & binLookup w/o panLength property', () => {
    test('#0 Fill out PAN & see that focus stays on number field', async ({ card }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        // Check start state
        await expect(card.cardNumberInput).not.toBeFocused();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect focus to be still be on number field
        await expect(card.cardNumberInput).toBeFocused();
        await expect(card.expiryDateInput).not.toBeFocused();
    });
});

test.describe('Test Card, & binLookup w. panLength property', () => {
    test('#1 Fill out PAN and see maxLength is not set on cardNumber SF, and that focus moves to expiryDate', async ({ card }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(CARD_WITH_PAN_LENGTH);

        // Expect UI change - expiryDate field has focus
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).toBeFocused();

        // Expect iframe to exist in number field with maxlength attr kept to 24, since we know mitigate against binLookup having incorrect panLength values
        let panInputMaxLength = await card.cardNumberInput.getAttribute('maxlength');
        expect(panInputMaxLength).toEqual('24');

        // Delete number and see that the maxlength is kept on the iframe
        await card.deleteCardNumber();
        panInputMaxLength = await card.cardNumberInput.getAttribute('maxlength');

        expect(panInputMaxLength).toEqual('24');
    });

    test('#2 Fill out PAN & see that focus moves to CVC since expiryDate is optional', async ({ card, page }) => {
        await binLookupMock(page, optionalDateWithPanLengthMock);

        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - cvc field has focus
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.cvcInput).toBeFocused();
    });

    test('#3 Fill out PAN & see that focus moves to CVC since expiryDate is hidden', async ({ card, page }) => {
        await binLookupMock(page, hiddenDateWithPanLengthMock);

        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - cvc field has focus
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.cvcInput).toBeFocused();
    });

    test('#4 Fill out PAN & see that focus moves to holderName since expiryDate & cvc are optional', async ({ card, page }) => {
        await binLookupMock(page, optionalDateAndCvcWithPanLengthMock);

        const componentConfig = { hasHolderName: true, holderNameRequired: true };

        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect UI change - holderName field has focus
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.holderNameInput).toBeFocused();
    });

    test('#5 Fill out invalid date on an optional date field, then fill & see that focus moves to (optional) expiryDate since expiryDate is in error', async ({
        card,
        page
    }) => {
        //
        await binLookupMock(page, optionalDateWithPanLengthMock);

        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        // Card out of date
        await card.fillExpiryDate('12/90');

        await page.waitForTimeout(500); // give time for srPanel/error messaging routine to run

        await card.typeCardNumber(CARD_WITH_PAN_LENGTH);

        // Expect UI change - expiryDate field has focus
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).toBeFocused();
    });

    test('#6 Fill out PAN by **pasting** number & see that that focus moves to expiryDate', async ({ card, page, browserName }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        // "Paste" number
        await card.fillCardNumber(CARD_WITH_PAN_LENGTH);
        await page.waitForTimeout(100);

        // Expect UI change - expiryDate field has focus
        await expect(card.cardNumberInput).not.toBeFocused();
        await expect(card.expiryDateInput).toBeFocused();
    });

    test(
        "#7 Fill out PAN with binLookup panLength of 18 and see that when you fill in the 16th digit the focus doesn't jump " +
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
            await expect(card.cardNumberInput).toBeFocused();
            await expect(card.expiryDateInput).not.toBeFocused();

            await page.waitForTimeout(100);

            // Type remaining digits
            await card.typeCardNumber(lastDigits);

            // Expect UI change - expiryDate field has focus
            await expect(card.cardNumberInput).not.toBeFocused();
            await expect(card.expiryDateInput).toBeFocused();

            await page.waitForTimeout(100);

            // Delete number
            await card.deleteCardNumber();

            // Expect focus back on number field
            await expect(card.cardNumberInput).toBeFocused();
            await expect(card.expiryDateInput).not.toBeFocused();

            // Reset mock
            await binLookupMock(page, amexWithPanLengthMock);

            // Type new PAN that will give different /binLookup response
            await card.typeCardNumber(AMEX_CARD);

            // Expect UI change - expiryDate field has focus again
            await expect(card.cardNumberInput).not.toBeFocused();
            await expect(card.expiryDateInput).toBeFocused();
        }
    );

    test('#8 Fill out PAN with Visa num that binLookup says has a panLength of 16 - you should then be able to type more digits in the card number field', async ({
        card
    }) => {
        await card.goto(URL_MAP.card);

        await card.isComponentVisible();

        await card.typeCardNumber(CARD_WITH_PAN_LENGTH);

        // Should be able to add more digits to the PAN
        await card.cardNumberInput.focus();
        await card.cardNumberInput.press('End'); /** NOTE: how to add text at end */
        await card.typeCardNumber('6');

        // Confirm PAN value has had chars added
        let val = await card.cardNumberInput.inputValue();
        expect(val).toEqual('4000 6200 0000 0007 6');
    });
});
