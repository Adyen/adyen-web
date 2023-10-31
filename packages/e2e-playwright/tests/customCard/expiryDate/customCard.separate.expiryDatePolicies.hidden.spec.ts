import { test, expect } from '../../../pages/customCard/customCard.fixture';
import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE,
    REGULAR_TEST_CARD
} from '../../utils/constants';
import { binLookupMock } from '../../../mocks/binLookup/binLookup.mock';
import { hiddenDateAndCvcMock } from '../../../mocks/binLookup/binLookup.data';
import LANG from '../../../../lib/src/language/locales/en-US.json';

// const CVC_LABEL = LANG['creditCard.securityCode.label'];
// const CVC_LABEL_OPTIONAL = LANG['creditCard.securityCode.label.optional'];
// const OPTIONAL = LANG['field.title.optional'];
const PAN_ERROR = LANG['error.va.sf-cc-num.02'];
const MONTH_EMPTY_ERROR = LANG['error.va.sf-cc-mth.01'];
const YEAR_EMPTY_ERROR = LANG['error.va.sf-cc-yr.01'];
const CVC_ERROR = LANG['error.va.sf-cc-cvc.01'];

test.describe('Test how Custom Card Component with separate date field handles hidden expiryDate policy', () => {
    // test('#1 Testing hidden expiryDatePolicy - how UI & state respond', async ({ customCardPage }) => {
    //     const { card, page } = customCardPage;
    //
    //     await binLookupMock(page, hiddenDateAndCvcMock);
    //
    //     await card.isComponentVisible();
    //
    //     // Fill number to provoke (mock) binLookup response
    //     await card.typeCardNumber(REGULAR_TEST_CARD);
    //
    //     // UI reflects that binLookup says expiryDate & cvc are hidden
    //     await expect(card.expiryDateField).not.toBeVisible();
    //     await expect(card.cvcField).not.toBeVisible();
    //
    //     // Card seen as valid
    //     let cardValid = await page.evaluate('window.customCard.isValid');
    //     await expect(cardValid).toEqual(true);
    //
    //     // Clear number and see UI & state reset
    //     await card.deleteCardNumber();
    //     await expect(card.expiryDateField).toBeVisible();
    //     await expect(card.cvcField).toBeVisible();
    // });

    test('#2 validating fields first and then entering PAN should see errors cleared from state', async ({ customCardPageSeparate }) => {
        const { card, page } = customCardPageSeparate;

        await binLookupMock(page, hiddenDateAndCvcMock);

        await card.isSeparateComponentVisible();

        // Click pay
        await customCardPageSeparate.pay('Separate');

        // Expect errors in UI
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR);
        await expect(card.expiryMonthErrorElement).toBeVisible();
        await expect(card.expiryMonthErrorElement).toHaveText(MONTH_EMPTY_ERROR);
        await expect(card.expiryYearErrorElement).toBeVisible();
        await expect(card.expiryYearErrorElement).toHaveText(YEAR_EMPTY_ERROR);
        await expect(card.cvcErrorElement).toBeVisible();
        await expect(card.cvcErrorElement).toHaveText(CVC_ERROR);

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.customCardSeparate.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_MONTH]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_YEAR]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect errors to be cleared - since the fields were in error because they were empty
        // but now the PAN field is filled and the other fields are hidden, so the fields have re-rendered and updated state
        cardErrors = await page.evaluate('window.customCardSeparate.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).toBe(null);
        await expect(cardErrors[ENCRYPTED_EXPIRY_MONTH]).toBe(null);
        await expect(cardErrors[ENCRYPTED_EXPIRY_YEAR]).toBe(null);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).toBe(null);

        // Card seen as valid
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);

        // await page.waitForTimeout(3000);
    });

    // test('#3 date field in error does not stop card becoming valid', async ({ customCardPage }) => {
    //     const { card, page } = customCardPage;
    //
    //     await binLookupMock(page, hiddenDateAndCvcMock);
    //
    //     await card.isComponentVisible();
    //
    //     // Card out of date
    //     await card.typeExpiryDate('12/90');
    //
    //     // Expect error in UI
    //     await expect(card.expiryDateField).toBeVisible();
    //     await expect(card.expiryDateErrorElement).toBeVisible();
    //     await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);
    //
    //     // Force blur event to fire on date field
    //     await card.cardNumberLabelElement.click();
    //
    //     // Fill number to provoke (mock) binLookup response
    //     await card.typeCardNumber(REGULAR_TEST_CARD);
    //
    //     // UI reflects that binLookup says expiryDate & cvc are hidden
    //     await expect(card.expiryDateField).not.toBeVisible();
    //     await expect(card.cvcField).not.toBeVisible();
    //
    //     // Card seen as valid (despite date field technically being in error)
    //     let cardValid = await page.evaluate('window.customCard.isValid');
    //     await expect(cardValid).toEqual(true);
    //
    //     // Expect error in state to remain
    //     let cardErrors: any = await page.evaluate('window.customCard.state.errors');
    //     await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);
    //
    //     await card.deleteCardNumber();
    //
    //     // Errors in UI visible again
    //     await expect(card.expiryDateField).toBeVisible();
    //     await expect(card.expiryDateErrorElement).toBeVisible();
    //     await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);
    //
    //     // Card is not valid
    //     cardValid = await page.evaluate('window.customCard.isValid');
    //     await expect(cardValid).toEqual(false);
    //
    //     // await page.waitForTimeout(5000);
    // });
});
