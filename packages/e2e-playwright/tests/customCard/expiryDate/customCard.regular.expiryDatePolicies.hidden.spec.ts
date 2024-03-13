import { test, expect } from '../../../pages/customCard/customCard.fixture';
import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_EXPIRY_DATE, ENCRYPTED_SECURITY_CODE, REGULAR_TEST_CARD } from '../../utils/constants';
import { binLookupMock } from '../../../mocks/binLookup/binLookup.mock';
import { hiddenDateAndCvcMock } from '../../../mocks/binLookup/binLookup.data';
import LANG from '../../../../lib/src/language/locales/en-US.json';

const PAN_ERROR = LANG['cc.num.900'];
const DATE_INVALID_ERROR = LANG['cc.dat.912'];
const DATE_EMPTY_ERROR = LANG['cc.dat.910'];
const CVC_ERROR = LANG['cc.cvc.920'];

test.describe('Test how Custom Card Component with regular date field handles hidden expiryDate policy', () => {
    test('#1 how UI & state respond', async ({ customCardPage }) => {
        const { card, page } = customCardPage;

        await binLookupMock(page, hiddenDateAndCvcMock);

        await card.isComponentVisible();

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate & cvc are hidden
        await expect(card.expiryDateField).not.toBeVisible();
        await expect(card.cvcField).not.toBeVisible();

        // Card seen as valid
        let cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number and see UI & state reset
        await card.deleteCardNumber();
        await expect(card.expiryDateField).toBeVisible();
        await expect(card.cvcField).toBeVisible();
    });

    test('#2 validating fields first and then entering PAN should see errors cleared from state', async ({ customCardPage }) => {
        const { card, page } = customCardPage;

        await binLookupMock(page, hiddenDateAndCvcMock);

        await card.isComponentVisible();

        // Click pay
        await customCardPage.pay();

        // Expect errors in UI
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR);
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_EMPTY_ERROR);
        await expect(card.cvcErrorElement).toBeVisible();
        await expect(card.cvcErrorElement).toHaveText(CVC_ERROR);

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.customCard.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

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

    test('#3 date field in error does not stop card becoming valid', async ({ customCardPage }) => {
        const { card, page } = customCardPage;

        await binLookupMock(page, hiddenDateAndCvcMock);

        await card.isComponentVisible();

        // Card out of date
        await card.typeExpiryDate('12/90');

        // Expect error in UI
        await expect(card.expiryDateField).toBeVisible();
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Force blur event to fire on date field
        await card.cardNumberLabelElement.click();

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate & cvc are hidden
        await expect(card.expiryDateField).not.toBeVisible();
        await expect(card.cvcField).not.toBeVisible();

        // Card seen as valid (despite date field technically being in error)
        let cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(true);

        // Expect error in state to remain
        let cardErrors: any = await page.evaluate('window.customCard.state.errors');
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);

        await card.deleteCardNumber();

        // Errors in UI visible again
        await expect(card.expiryDateField).toBeVisible();
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // CVC visible again
        await expect(card.cvcField).toBeVisible();

        // Headless test seems to need time for UI change to register on state
        await page.waitForTimeout(500);

        // Card is not valid
        cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(false);

        // await page.waitForTimeout(5000);
    });
});
