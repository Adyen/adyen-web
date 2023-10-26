import { test, expect } from '../../../pages/cards/card.fixture';
import { SYNCHRONY_PLCC_NO_DATE, TEST_CVC_VALUE, ENCRYPTED_CARD_NUMBER, ENCRYPTED_EXPIRY_DATE, ENCRYPTED_SECURITY_CODE } from '../../utils/constants';
import LANG from '../../../../lib/src/language/locales/en-US.json';

const PAN_ERROR = LANG['error.va.sf-cc-num.02'];
const DATE_INVALID_ERROR = LANG['error.va.sf-cc-dat.01'];
const DATE_EMPTY_ERROR = LANG['error.va.sf-cc-dat.04'];
const CVC_ERROR = LANG['error.va.sf-cc-cvc.01'];

test.describe('Test how Card Component handles hidden expiryDate policy', () => {
    test('#1 Testing hidden expiryDatePolicy - how UI & state respond', async ({ cardExpiryDatePoliciesPage }) => {
        const { card, page } = cardExpiryDatePoliciesPage;

        await card.isComponentVisible();

        // Fill number to provoke binLookup response
        await card.typeCardNumber(SYNCHRONY_PLCC_NO_DATE);

        // UI reflects that binLookup says expiryDate is hidden
        await expect(card.expiryDateField).not.toBeVisible();

        await card.typeCvc(TEST_CVC_VALUE);

        // Card seen as valid
        let cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number
        await card.deleteCardNumber();

        // UI is reset
        await expect(card.expiryDateField).toBeVisible();

        // Card seen as invalid
        cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(false);
    });

    test('#2 Validating fields first should see visible errors and then entering PAN should see errors cleared from state', async ({
        cardExpiryDatePoliciesPage
    }) => {
        const { card, page } = cardExpiryDatePoliciesPage;

        await card.isComponentVisible();

        await cardExpiryDatePoliciesPage.pay();

        // Expect errors in UI
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR);
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_EMPTY_ERROR);
        await expect(card.cvcErrorElement).toBeVisible();
        await expect(card.cvcErrorElement).toHaveText(CVC_ERROR);

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.card.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke binLookup response
        await card.typeCardNumber(SYNCHRONY_PLCC_NO_DATE);

        // Expect errors to be cleared - since the fields were in error because they were empty
        // but now the PAN field is filled and the date field is hidden & the fields have re-rendered and updated state
        cardErrors = await page.evaluate('window.card.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).toBe(null);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).toBe(null);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).toBe(null);
    });

    test('#3 Hidden date field in error does not stop card becoming valid', async ({ cardExpiryDatePoliciesPage }) => {
        const { card, page } = cardExpiryDatePoliciesPage;

        await card.isComponentVisible();

        // Card out of date
        await card.typeExpiryDate('12/90');

        // Expect error in UI
        await expect(card.expiryDateField).toBeVisible();
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Force blur event to fire on date field
        await card.cardNumberLabelElement.click();

        // Fill number to provoke binLookup response
        await card.typeCardNumber(SYNCHRONY_PLCC_NO_DATE);

        // UI reflects that binLookup says expiryDate is hidden
        await expect(card.expiryDateField).not.toBeVisible();
        await expect(card.expiryDateErrorElement).not.toBeVisible();

        // complete fields
        await card.typeCvc(TEST_CVC_VALUE);

        // Card seen as valid (despite date field technically being in error)
        let cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(true);

        // Expect errors in state to remain
        let cardErrors: any = await page.evaluate('window.card.state.errors');
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);

        // Clear number
        await card.deleteCardNumber();

        // Errors in UI visible again
        await expect(card.expiryDateField).toBeVisible();
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Card is not valid
        cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(false);
    });
});
