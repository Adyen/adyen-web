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
import { optionalDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

const MONTH_LABEL = 'Expiry month';
const YEAR_LABEL = 'Expiry year';
const CVC_LABEL = 'Security code';
const OPTIONAL = LANG['field.title.optional'];

const PAN_ERROR = LANG['cc.num.900'];
const MONTH_EMPTY_ERROR = LANG['cc.mth.915'];
const YEAR_EMPTY_ERROR = LANG['cc.yr.917'];
const CVC_ERROR = LANG['cc.cvc.920'];
const DATE_INVALID_ERROR = LANG['cc.dat.913'];

test.describe('Test how Custom Card Component with separate date fields handles hidden expiryDate policy', () => {
    test('#1 how UI & state respond', async ({ page, customCardSeparateExpiryDate }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // Regular date labels
        await expect(customCardSeparateExpiryDate.expiryMonthLabelText).toContainText(MONTH_LABEL);
        await expect(customCardSeparateExpiryDate.expiryYearLabelText).toContainText(YEAR_LABEL);

        // Fill number to provoke (mock) binLookup response
        await customCardSeparateExpiryDate.typeCardNumber(REGULAR_TEST_CARD);

        // await page.waitForTimeout(5000);

        // UI reflects that binLookup says date fields are optional
        await expect(customCardSeparateExpiryDate.expiryMonthLabelText).toContainText(`${MONTH_LABEL} ${OPTIONAL}`);
        await expect(customCardSeparateExpiryDate.expiryYearLabelText).toContainText(`${YEAR_LABEL} ${OPTIONAL}`);

        // ...and cvc is optional too
        await expect(customCardSeparateExpiryDate.cvcLabelText).toContainText(`${CVC_LABEL} ${OPTIONAL}`);

        // Card seen as valid
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number and see UI & state reset
        await customCardSeparateExpiryDate.deleteCardNumber();

        // Headless test seems to need time for UI change to register on state
        await page.waitForTimeout(500);

        // date and cvc labels don't contain 'optional'
        await expect(customCardSeparateExpiryDate.expiryMonthLabelText).toContainText(MONTH_LABEL);
        await expect(customCardSeparateExpiryDate.expiryYearLabelText).toContainText(YEAR_LABEL);
        await expect(customCardSeparateExpiryDate.cvcLabelText).toContainText(CVC_LABEL);

        // Card seen as invalid
        cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(false);
    });

    test('#3 validating fields first and then entering PAN should see errors cleared from both UI & state', async ({
        page,
        customCardSeparateExpiryDate
    }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // press pay to generate errors
        await customCardSeparateExpiryDate.pay();

        // Expect errors in UI
        await expect(customCardSeparateExpiryDate.cardNumberErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.cardNumberErrorElement).toContainText(PAN_ERROR);
        await expect(customCardSeparateExpiryDate.expiryMonthErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryMonthErrorElement).toContainText(MONTH_EMPTY_ERROR);
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toContainText(YEAR_EMPTY_ERROR);
        await expect(customCardSeparateExpiryDate.cvcErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.cvcErrorElement).toContainText(CVC_ERROR);

        await page.waitForTimeout(500); // wait for UI to show errors

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.customCardSeparate.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_MONTH]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_YEAR]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke (mock) binLookup response
        await customCardSeparateExpiryDate.typeCardNumber(REGULAR_TEST_CARD);

        // Expect errors to be cleared - since the fields were in error because they were empty
        // but now the PAN field is filled and the date & cvc field are optional & the fields have re-rendered and updated state

        // No errors in UI
        await expect(customCardSeparateExpiryDate.cardNumberErrorElement).not.toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryMonthErrorElement).not.toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).not.toBeVisible();
        await expect(customCardSeparateExpiryDate.cvcErrorElement).not.toBeVisible();

        // No errors in state
        cardErrors = await page.evaluate('window.customCardSeparate.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).toBe(null);
        await expect(cardErrors[ENCRYPTED_EXPIRY_MONTH]).toBe(null);
        await expect(cardErrors[ENCRYPTED_EXPIRY_YEAR]).toBe(null);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).toBe(null);

        // Card seen as valid - now we have a PAN and all the other fields are optional
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);
    });

    test('#4 date field in error DOES stop card becoming valid', async ({ page, customCardSeparateExpiryDate }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // Card out of date
        await customCardSeparateExpiryDate.typeExpiryMonth('12');
        await customCardSeparateExpiryDate.typeExpiryYear('90');

        // Expect error in UI
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toContainText(DATE_INVALID_ERROR);

        // Force blur event to fire on date field
        await customCardSeparateExpiryDate.cardNumberLabelElement.click();

        // Fill number to provoke (mock) binLookup response
        await customCardSeparateExpiryDate.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate is optional
        await expect(customCardSeparateExpiryDate.expiryMonthLabelText).toContainText(`${MONTH_LABEL} ${OPTIONAL}`);
        await expect(customCardSeparateExpiryDate.expiryYearLabelText).toContainText(`${YEAR_LABEL} ${OPTIONAL}`);

        // Visual errors persist in UI
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toBeVisible();
        await expect(customCardSeparateExpiryDate.expiryYearErrorElement).toContainText(DATE_INVALID_ERROR);

        // Card seen as invalid
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(false);

        // Delete erroneous date
        await customCardSeparateExpiryDate.deleteExpiryMonth();
        await customCardSeparateExpiryDate.deleteExpiryYear();

        // Headless test seems to need time for UI reset to register on state
        await page.waitForTimeout(500);

        // Card now seen as valid
        cardValid = await page.evaluate('globalThis.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);
    });
});
