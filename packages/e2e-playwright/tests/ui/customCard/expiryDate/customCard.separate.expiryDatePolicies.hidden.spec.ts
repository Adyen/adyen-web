import { test, expect } from '../../../../fixtures/customCard.fixture';
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
    test('#1 how UI & state respond', async ({ page, customCardSeparateExpiryDate }) => {
        await binLookupMock(page, hiddenDateAndCvcMock);

        // Fill number to provoke (mock) binLookup response
        await customCardSeparateExpiryDate.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says date fields & cvc are hidden
        await expect(customCardSeparateExpiryDate.expiryMonthField).not.toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearField).not.toBeVisible();
        await expect(customCardSeparateExpiryDate.cvcField).not.toBeVisible();

        // Card seen as valid
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number and see UI & state reset
        await customCardSeparateExpiryDate.deleteCardNumber();
        await expect(customCardSeparateExpiryDate.expiryMonthField).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearField).toBeVisible();
        await expect(customCardSeparateExpiryDate.cvcField).toBeVisible();
    });

    test('#2 validating fields first and then entering PAN should see errors cleared from state', async ({ page, customCardSeparateExpiryDate }) => {
        await binLookupMock(page, hiddenDateAndCvcMock);

        // Click pay
        await customCardSeparateExpiryDate.pay();

        // Expect errors in UI
        await expect(customCardSeparateExpiryDate.cardNumberErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.cardNumberErrorElement).toHaveText(PAN_ERROR);
        await expect(customCardSeparateExpiryDate.expiryMonthErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryMonthErrorElement).toHaveText(MONTH_EMPTY_ERROR);
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toHaveText(YEAR_EMPTY_ERROR);
        await expect(customCardSeparateExpiryDate.cvcErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.cvcErrorElement).toHaveText(CVC_ERROR);

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.customCardSeparate.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_MONTH]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_YEAR]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke (mock) binLookup response
        await customCardSeparateExpiryDate.typeCardNumber(REGULAR_TEST_CARD);

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
    // todo: flaky
    test.fixme('#3 date field in error does not stop card becoming valid', async ({ page, customCardSeparateExpiryDate }) => {
        await binLookupMock(page, hiddenDateAndCvcMock);

        // Card out of date
        await customCardSeparateExpiryDate.typeExpiryMonth('12');
        await customCardSeparateExpiryDate.typeExpiryYear('90');

        // Expect error in UI
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Force blur event to fire on year field
        await customCardSeparateExpiryDate.cardNumberLabelElement.click();

        // Fill number to provoke (mock) binLookup response
        await customCardSeparateExpiryDate.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says date fields & cvc are hidden
        await expect(customCardSeparateExpiryDate.expiryMonthField).not.toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearField).not.toBeVisible();
        await expect(customCardSeparateExpiryDate.cvcField).not.toBeVisible();

        // Card seen as valid (despite date technically being in error)
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);

        // Expect error in state to remain
        let cardErrors: any = await page.evaluate('window.customCardSeparate.state.errors');
        await expect(cardErrors[ENCRYPTED_EXPIRY_YEAR]).not.toBe(undefined);

        await customCardSeparateExpiryDate.deleteCardNumber();

        // Errors in UI visible again
        await expect(customCardSeparateExpiryDate.expiryYearField).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Other fields visible again
        await expect(customCardSeparateExpiryDate.expiryMonthField).toBeVisible();
        await expect(customCardSeparateExpiryDate.cvcField).toBeVisible();

        // Headless test seems to need time for UI change to register on state
        await page.waitForTimeout(500);

        // Card is not valid
        cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(false);

        // await page.waitForTimeout(3000);
    });
});
