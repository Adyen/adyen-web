import { test, expect } from '../../../../fixtures/customCard/customCard.fixture';
import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_EXPIRY_DATE, ENCRYPTED_SECURITY_CODE, REGULAR_TEST_CARD } from '../../../utils/constants';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { hiddenDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';
import LANG from '../../../../../server/translations/en-US.json';

const PAN_ERROR = LANG['cc.num.900'];
const DATE_INVALID_ERROR = LANG['cc.dat.912'];
const DATE_EMPTY_ERROR = LANG['cc.dat.910'];
const CVC_ERROR = LANG['cc.cvc.920'];

test.describe('Test how Custom Card Component with regular date field handles hidden expiryDate policy', () => {
    test('#1 how UI & state respond', async ({ page, customCardPage }) => {
        await binLookupMock(page, hiddenDateAndCvcMock);

        // Fill number to provoke (mock) binLookup response
        await customCardPage.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate & cvc are hidden
        await expect(customCardPage.expiryDateField).not.toBeVisible();
        await expect(customCardPage.cvcField).not.toBeVisible();

        // Card seen as valid
        let cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number and see UI & state reset
        await customCardPage.deleteCardNumber();
        await expect(customCardPage.expiryDateField).toBeVisible();
        await expect(customCardPage.cvcField).toBeVisible();
    });

    test('#2 validating fields first and then entering PAN should see errors cleared from state', async ({ page, customCardPage }) => {
        await binLookupMock(page, hiddenDateAndCvcMock);

        // Click pay
        await customCardPage.pay();

        // Expect errors in UI
        await expect(customCardPage.cardNumberErrorElement).toBeVisible();
        await expect(customCardPage.cardNumberErrorElement).toHaveText(PAN_ERROR);
        await expect(customCardPage.expiryDateErrorElement).toBeVisible();
        await expect(customCardPage.expiryDateErrorElement).toHaveText(DATE_EMPTY_ERROR);
        await expect(customCardPage.cvcErrorElement).toBeVisible();
        await expect(customCardPage.cvcErrorElement).toHaveText(CVC_ERROR);

        await page.waitForTimeout(500); // wait for UI to show errors

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.customCard.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke (mock) binLookup response
        await customCardPage.typeCardNumber(REGULAR_TEST_CARD);

        // Expect errors to be cleared - since the fields were in error because they were empty
        // but now the PAN field is filled and the other fields are hidden, so the fields have re-rendered and updated state
        cardErrors = await page.evaluate('window.customCard.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).toBe(null);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).toBe(null);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).toBe(null);

        // Card seen as valid
        let cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(true);
    });

    test('#3 date field in error does not stop card becoming valid', async ({ page, customCardPage }) => {
        await binLookupMock(page, hiddenDateAndCvcMock);

        // Card out of date
        await customCardPage.typeExpiryDate('12/90');

        // Expect error in UI
        await expect(customCardPage.expiryDateField).toBeVisible();
        await expect(customCardPage.expiryDateErrorElement).toBeVisible();
        await expect(customCardPage.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Force blur event to fire on date field
        await customCardPage.cardNumberLabelElement.click();

        // Fill number to provoke (mock) binLookup response
        await customCardPage.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate & cvc are hidden
        await expect(customCardPage.expiryDateField).not.toBeVisible();
        await expect(customCardPage.cvcField).not.toBeVisible();

        // Card seen as valid (despite date field technically being in error)
        let cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(true);

        // Expect error in state to remain
        let cardErrors: any = await page.evaluate('window.customCard.state.errors');
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);

        await customCardPage.deleteCardNumber();

        // Errors in UI visible again
        await expect(customCardPage.expiryDateField).toBeVisible();
        await expect(customCardPage.expiryDateErrorElement).toBeVisible();
        await expect(customCardPage.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // CVC visible again
        await expect(customCardPage.cvcField).toBeVisible();

        // Headless test seems to need time for UI change to register on state
        await page.waitForTimeout(500);

        // Card is not valid
        cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(false);

        // await page.waitForTimeout(5000);
    });
});
