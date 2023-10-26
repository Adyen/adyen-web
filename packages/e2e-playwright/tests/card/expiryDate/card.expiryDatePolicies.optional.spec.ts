import { test, expect } from '../../../pages/cards/card.fixture';
import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_EXPIRY_DATE, ENCRYPTED_SECURITY_CODE, REGULAR_TEST_CARD } from '../../utils/constants';
import { binLookupMock } from '../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../mocks/binLookup/binLookup.data';
import LANG from '../../../../lib/src/language/locales/en-US.json';

const DATE_LABEL = LANG['creditCard.expiryDate.label'];
const CVC_LABEL = LANG['creditCard.securityCode.label'];
const CVC_LABEL_OPTIONAL = LANG['creditCard.securityCode.label.optional'];
const OPTIONAL = LANG['field.title.optional'];
const PAN_ERROR = LANG['error.va.sf-cc-num.02'];
const DATE_INVALID_ERROR = LANG['error.va.sf-cc-dat.01'];
const DATE_EMPTY_ERROR = LANG['error.va.sf-cc-dat.04'];
const CVC_ERROR = LANG['error.va.sf-cc-cvc.01'];

test.describe('Test how Card Component handles optional expiryDate policy', () => {
    test('#1 Testing optional expiryDatePolicy - how UI & state respond', async ({ cardExpiryDatePoliciesPage }) => {
        const { card, page } = cardExpiryDatePoliciesPage;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isComponentVisible();

        // Regular date label
        await expect(card.expiryDateLabelText).toHaveText(DATE_LABEL);

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate is optional
        await expect(card.expiryDateLabelText).toHaveText(`${DATE_LABEL} ${OPTIONAL}`);

        // ...and cvc is optional too
        await expect(card.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);

        // Card seen as valid
        let cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number and see UI & state reset
        await card.deleteCardNumber();

        // date and cvc labels don't contain 'optional'
        await expect(card.expiryDateLabelText).toHaveText(DATE_LABEL);
        await expect(card.cvcLabelText).toHaveText(CVC_LABEL);

        // Card seen as invalid
        cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(false);
    });

    test('#2 Testing optional expiryDatePolicy - how securedField responds', async ({ cardExpiryDatePoliciesPage }) => {
        const { card, page } = cardExpiryDatePoliciesPage;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isComponentVisible();

        // Expect iframe's expiryDate input field to have an aria-required attr set to true
        let dateAriaRequired = await card.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('true');

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect iframe's expiryDate input field to have an aria-required attr set to false
        dateAriaRequired = await card.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('false');

        // Clear number and see SF's aria-required reset
        await card.deleteCardNumber();
        dateAriaRequired = await card.expiryDateInput.getAttribute('aria-required');
        await expect(dateAriaRequired).toEqual('true');
    });

    test('#3 validating fields first and then entering PAN should see errors cleared from both UI & state', async ({
        cardExpiryDatePoliciesPage
    }) => {
        const { card, page } = cardExpiryDatePoliciesPage;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isComponentVisible();

        // press pay to generate errors
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

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // await page.waitForTimeout(5000);

        // Expect errors to be cleared - since the fields were in error because they were empty
        // but now the PAN field is filled and the date & cvc field are optional & the fields have re-rendered and updated state

        // No errors in UI
        await expect(card.cardNumberErrorElement).not.toBeVisible();
        await expect(card.expiryDateErrorElement).not.toBeVisible();
        await expect(card.cvcErrorElement).not.toBeVisible();

        // No errors in state
        cardErrors = await page.evaluate('window.card.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).toBe(null);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).toBe(null);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).toBe(null);
    });

    test('#4 date field in error DOES stop card becoming valid', async ({ cardExpiryDatePoliciesPage }) => {
        const { card, page } = cardExpiryDatePoliciesPage;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isComponentVisible();

        // Card out of date
        await card.typeExpiryDate('12/90');

        // Expect error in UI
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Force blur event to fire on date field
        await card.cardNumberLabelElement.click();

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate is optional
        await expect(card.expiryDateLabelText).toHaveText(`${DATE_LABEL} ${OPTIONAL}`);

        // Visual errors persist in UI
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Card seen as invalid
        let cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(false);

        // Delete erroneous date
        await card.deleteExpiryDate();

        // Card now seen as valid
        cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(true);
    });
});
