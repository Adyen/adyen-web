import { test, expect } from '../../../../fixtures/customCard.fixture';
import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_SECURITY_CODE,
    INVALID_TEST_DATE_VALUE,
    REGULAR_TEST_CARD
} from '../../../utils/constants';
import LANG from '../../../../../server/translations/en-US.json';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../../mocks/binLookup/binLookup.data';

const DATE_LABEL = LANG['creditCard.expiryDate.label'];
const CVC_LABEL = LANG['creditCard.securityCode.label'];
const CVC_LABEL_OPTIONAL = LANG['creditCard.securityCode.label.optional'];

const OPTIONAL = LANG['field.title.optional'];

const PAN_ERROR = LANG['cc.num.900'];
const DATE_INVALID_ERROR = LANG['cc.dat.912'];
const DATE_EMPTY_ERROR = LANG['cc.dat.910'];
const CVC_ERROR = LANG['cc.cvc.920'];

test.describe('Test how Custom Card Component with regular date field handles hidden expiryDate policy', () => {
    test('#1 how UI & state respond', async ({ page, customCard }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // Regular date label
        await expect(customCard.expiryDateLabelText).toHaveText(DATE_LABEL);

        // Fill number to provoke (mock) binLookup response
        await customCard.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate is optional
        await expect(customCard.expiryDateLabelText).toContainText(`${DATE_LABEL} ${OPTIONAL}`);

        // ...and cvc is optional too
        await expect(customCard.cvcLabelText).toContainText(CVC_LABEL_OPTIONAL);

        // Card seen as valid
        let cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number and see UI & state reset
        await customCard.deleteCardNumber();

        // Headless test seems to need time for UI change to register on state
        await page.waitForTimeout(500);

        // date and cvc labels don't contain 'optional'
        await expect(customCard.expiryDateLabelText).toContainText(DATE_LABEL);
        await expect(customCard.cvcLabelText).toHaveText(CVC_LABEL);

        // Card seen as invalid
        cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(false);

        // await page.waitForTimeout(3000);
    });

    test('#3 validating fields first and then entering PAN should see errors cleared from both UI & state', async ({ page, customCard }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // press pay to generate errors
        await customCard.pay();

        // Expect errors in UI
        await expect(customCard.cardNumberErrorElement).toBeVisible();
        await expect(customCard.cardNumberErrorElement).toHaveText(PAN_ERROR);
        await expect(customCard.expiryDateErrorElement).toBeVisible();
        await expect(customCard.expiryDateErrorElement).toHaveText(DATE_EMPTY_ERROR);
        await expect(customCard.cvcErrorElement).toBeVisible();
        await expect(customCard.cvcErrorElement).toHaveText(CVC_ERROR);

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.customCard.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke (mock) binLookup response
        await customCard.typeCardNumber(REGULAR_TEST_CARD);

        // Expect errors to be cleared - since the fields were in error because they were empty
        // but now the PAN field is filled and the date & cvc field are optional & the fields have re-rendered and updated state

        // No errors in UI
        await expect(customCard.cardNumberErrorElement).not.toBeVisible();
        await expect(customCard.expiryDateErrorElement).not.toBeVisible();
        await expect(customCard.cvcErrorElement).not.toBeVisible();

        // No errors in state
        cardErrors = await page.evaluate('window.customCard.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).toBe(null);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).toBe(null);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).toBe(null);
    });
    // todo: flaky
    test.fixme('#4 date field in error DOES stop card becoming valid', async ({ page, customCard }) => {
        await binLookupMock(page, optionalDateAndCvcMock);

        // Card out of date
        await customCard.typeExpiryDate(INVALID_TEST_DATE_VALUE);

        // Expect error in UI
        await expect(customCard.expiryDateErrorElement).toBeVisible();
        await expect(customCard.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Force blur event to fire on date field
        await customCard.cardNumberLabelElement.click();

        // Fill number to provoke (mock) binLookup response
        await customCard.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate is optional
        await expect(customCard.expiryDateLabelText).toContainText(`${DATE_LABEL} ${OPTIONAL}`);

        // Visual errors persist in UI
        await expect(customCard.expiryDateErrorElement).toBeVisible();
        await expect(customCard.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Card seen as invalid
        let cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(false);

        // Delete erroneous date
        await customCard.deleteExpiryDate();

        // Headless test seems to need time for UI reset to register on state
        await page.waitForTimeout(500);

        // Card now seen as valid
        cardValid = await page.evaluate('window.customCard.isValid');
        await expect(cardValid).toEqual(true);
    });
});
