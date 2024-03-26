import { test, expect } from '../../../pages/customCard/customCard.fixture';
import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE,
    REGULAR_TEST_CARD
} from '../../utils/constants';
import { binLookupMock } from '../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../mocks/binLookup/binLookup.data';
import LANG from '../../../../server/translations/en-US.json';

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
    test('#1 how UI & state respond', async ({ customCardPageSeparate }) => {
        const { card, page } = customCardPageSeparate;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isSeparateComponentVisible();

        // Regular date labels
        await expect(card.expiryMonthLabelText).toHaveText(MONTH_LABEL);
        await expect(card.expiryYearLabelText).toHaveText(YEAR_LABEL);

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // await page.waitForTimeout(5000);

        // UI reflects that binLookup says date fields are optional
        await expect(card.expiryMonthLabelText).toHaveText(`${MONTH_LABEL} ${OPTIONAL}`);
        await expect(card.expiryYearLabelText).toHaveText(`${YEAR_LABEL} ${OPTIONAL}`);

        // ...and cvc is optional too
        await expect(card.cvcLabelText).toHaveText(`${CVC_LABEL} ${OPTIONAL}`);

        // Card seen as valid
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number and see UI & state reset
        await card.deleteCardNumber();

        // Headless test seems to need time for UI change to register on state
        await page.waitForTimeout(500);

        // date and cvc labels don't contain 'optional'
        await expect(card.expiryMonthLabelText).toHaveText(MONTH_LABEL);
        await expect(card.expiryYearLabelText).toHaveText(YEAR_LABEL);
        await expect(card.cvcLabelText).toHaveText(CVC_LABEL);

        // Card seen as invalid
        cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(false);
    });

    test('#2 how securedField responds', async ({ customCardPageSeparate }) => {
        const { card, page } = customCardPageSeparate;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isSeparateComponentVisible();

        // Expect iframe's date (& cvc) input fields to have an aria-required attr set to true
        let monthAriaRequired = await card.expiryMonthInput.getAttribute('aria-required');
        await expect(monthAriaRequired).toEqual('true');

        let yearAriaRequired = await card.expiryYearInput.getAttribute('aria-required');
        await expect(yearAriaRequired).toEqual('true');

        let cvcAriaRequired = await card.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect iframe's date (& cvc) input fields to have an aria-required attr set to false
        monthAriaRequired = await card.expiryMonthInput.getAttribute('aria-required');
        await expect(monthAriaRequired).toEqual('false');

        yearAriaRequired = await card.expiryYearInput.getAttribute('aria-required');
        await expect(yearAriaRequired).toEqual('false');

        cvcAriaRequired = await card.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('false');

        // Clear number and see SF's aria-required reset
        await card.deleteCardNumber();

        monthAriaRequired = await card.expiryMonthInput.getAttribute('aria-required');
        await expect(monthAriaRequired).toEqual('true');

        yearAriaRequired = await card.expiryYearInput.getAttribute('aria-required');
        await expect(yearAriaRequired).toEqual('true');

        cvcAriaRequired = await card.cvcInput.getAttribute('aria-required');
        await expect(cvcAriaRequired).toEqual('true');
    });

    test('#3 validating fields first and then entering PAN should see errors cleared from both UI & state', async ({ customCardPageSeparate }) => {
        const { card, page } = customCardPageSeparate;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isSeparateComponentVisible();

        // press pay to generate errors
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

        // await page.waitForTimeout(3000);

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.customCardSeparate.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_MONTH]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_YEAR]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Expect errors to be cleared - since the fields were in error because they were empty
        // but now the PAN field is filled and the date & cvc field are optional & the fields have re-rendered and updated state

        // No errors in UI
        await expect(card.cardNumberErrorElement).not.toBeVisible();
        await expect(card.expiryMonthErrorElement).not.toBeVisible();
        await expect(card.expiryYearErrorElement).not.toBeVisible();
        await expect(card.cvcErrorElement).not.toBeVisible();

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

    test('#4 date field in error DOES stop card becoming valid', async ({ customCardPageSeparate }) => {
        const { card, page } = customCardPageSeparate;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isSeparateComponentVisible();

        // Card out of date
        await card.typeExpiryMonth('12');
        await card.typeExpiryYear('90');

        // Expect error in UI
        await expect(card.expiryYearErrorElement).toBeVisible();
        await expect(card.expiryYearErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Force blur event to fire on date field
        await card.cardNumberLabelElement.click();

        // Fill number to provoke (mock) binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate is optional
        await expect(card.expiryMonthLabelText).toHaveText(`${MONTH_LABEL} ${OPTIONAL}`);
        await expect(card.expiryYearLabelText).toHaveText(`${YEAR_LABEL} ${OPTIONAL}`);

        // Visual errors persist in UI
        await expect(card.expiryYearErrorElement).toBeVisible();
        await expect(card.expiryYearErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Card seen as invalid
        let cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(false);

        // Delete erroneous date
        await card.deleteExpiryMonth();
        await card.deleteExpiryYear();

        // Headless test seems to need time for UI reset to register on state
        await page.waitForTimeout(500);

        // Card now seen as valid
        cardValid = await page.evaluate('window.customCardSeparate.isValid');
        await expect(cardValid).toEqual(true);
    });
});
