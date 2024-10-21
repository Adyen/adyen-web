import { test, expect } from '../../../../fixtures/customCard/customCard.fixture';
import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE,
    REGULAR_TEST_CARD
} from '../../../utils/constants';
import LANG from '../../../../../server/translations/en-US.json';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { hiddenDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

const PAN_ERROR = LANG['cc.num.900'];
const MONTH_EMPTY_ERROR = LANG['cc.mth.915'];
const YEAR_EMPTY_ERROR = LANG['cc.yr.917'];
const DATE_INVALID_ERROR = LANG['cc.dat.913'];
const CVC_ERROR = LANG['cc.cvc.920'];

test.describe('Test how Custom Card Component with separate date field handles hidden expiryDate policy', () => {
    test('#1 how UI & state respond', async ({ page, customCardPageSeparate }) => {
        await binLookupMock(page, hiddenDateAndCvcMock);

        // Fill number to provoke (mock) binLookup response
        await customCardPageSeparate.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says date fields & cvc are hidden
        await expect(customCardPageSeparate.expiryMonthField).not.toBeVisible();
        await expect(customCardPageSeparate.expiryYearField).not.toBeVisible();
        await expect(customCardPageSeparate.cvcField).not.toBeVisible();

        // Card seen as valid
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number and see UI & state reset
        await customCardPageSeparate.deleteCardNumber();
        await expect(customCardPageSeparate.expiryMonthField).toBeVisible();
        await expect(customCardPageSeparate.expiryYearField).toBeVisible();
        await expect(customCardPageSeparate.cvcField).toBeVisible();
    });

    test('#2 validating fields first and then entering PAN should see errors cleared from state', async ({ page, customCardPageSeparate }) => {
        await binLookupMock(page, hiddenDateAndCvcMock);

        // Click pay
        await customCardPageSeparate.pay();

        // Expect errors in UI
        await expect(customCardPageSeparate.cardNumberErrorElement).toBeVisible();
        await expect(customCardPageSeparate.cardNumberErrorElement).toHaveText(PAN_ERROR);
        await expect(customCardPageSeparate.expiryMonthErrorElement).toBeVisible();
        await expect(customCardPageSeparate.expiryMonthErrorElement).toHaveText(MONTH_EMPTY_ERROR);
        await expect(customCardPageSeparate.expiryYearErrorElement).toBeVisible();
        await expect(customCardPageSeparate.expiryYearErrorElement).toHaveText(YEAR_EMPTY_ERROR);
        await expect(customCardPageSeparate.cvcErrorElement).toBeVisible();
        await expect(customCardPageSeparate.cvcErrorElement).toHaveText(CVC_ERROR);

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.customCardSeparate.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_MONTH]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_YEAR]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke (mock) binLookup response
        await customCardPageSeparate.typeCardNumber(REGULAR_TEST_CARD);

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
    });

    test('#3 date field in error does not stop card becoming valid', async ({ page, customCardPageSeparate }) => {
        await binLookupMock(page, hiddenDateAndCvcMock);

        // Card out of date
        await customCardPageSeparate.typeExpiryMonth('12');
        await customCardPageSeparate.typeExpiryYear('90');

        // Expect error in UI
        await expect(customCardPageSeparate.expiryYearErrorElement).toBeVisible();
        await expect(customCardPageSeparate.expiryYearErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Force blur event to fire on year field
        await customCardPageSeparate.cardNumberLabelElement.click();

        // Fill number to provoke (mock) binLookup response
        await customCardPageSeparate.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says date fields & cvc are hidden
        await expect(customCardPageSeparate.expiryMonthField).not.toBeVisible();
        await expect(customCardPageSeparate.expiryYearField).not.toBeVisible();
        await expect(customCardPageSeparate.cvcField).not.toBeVisible();

        // Card seen as valid (despite date technically being in error)
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);

        // Expect error in state to remain
        let cardErrors: any = await page.evaluate('window.customCardSeparate.state.errors');
        await expect(cardErrors[ENCRYPTED_EXPIRY_YEAR]).not.toBe(undefined);

        await customCardPageSeparate.deleteCardNumber();

        // Errors in UI visible again
        await expect(customCardPageSeparate.expiryYearField).toBeVisible();
        await expect(customCardPageSeparate.expiryYearErrorElement).toBeVisible();
        await expect(customCardPageSeparate.expiryYearErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Other fields visible again
        await expect(customCardPageSeparate.expiryMonthField).toBeVisible();
        await expect(customCardPageSeparate.cvcField).toBeVisible();

        // Headless test seems to need time for UI change to register on state
        await page.waitForTimeout(500);

        // Card is not valid
        cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(false);

        // await page.waitForTimeout(3000);
    });
});
