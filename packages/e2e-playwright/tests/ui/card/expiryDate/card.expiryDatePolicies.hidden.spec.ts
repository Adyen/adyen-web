import { test, expect } from '../../../../fixtures/card.fixture';
import LANG from '../../../../../server/translations/en-US.json';
import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_SECURITY_CODE,
    PLCC_NO_LUHN_NO_DATE,
    TEST_CVC_VALUE
} from '../../../utils/constants';
import { getStoryUrl } from '../../../utils/getStoryUrl';

const PAN_ERROR = LANG['cc.num.900'];
const DATE_INVALID_ERROR = LANG['cc.dat.912'];
const DATE_EMPTY_ERROR = LANG['cc.dat.910'];
const CVC_ERROR = LANG['cc.cvc.920'];

const urlNoAutoFocus = '/iframe.html?args=srConfig.moveFocus:!false&globals=&id=cards-card--default&viewMode=story';
const url = getStoryUrl({ baseUrl: urlNoAutoFocus, componentConfig: { brands: ['mc', 'visa', 'amex', 'synchrony_plcc'] } });

test.describe('Test how Card Component handles hidden expiryDate policy', () => {
    test('#1 how UI & state respond', async ({ page, card }) => {
        await card.goto(url);

        // Fill number to provoke binLookup response
        await card.typeCardNumber(PLCC_NO_LUHN_NO_DATE);

        // UI reflects that binLookup says expiryDate is hidden
        await expect(card.expiryDateField).not.toBeVisible();

        await card.typeCvc(TEST_CVC_VALUE);

        // Card seen as valid
        let cardValid = await page.evaluate('window.component.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number
        await card.deleteCardNumber();

        // UI is reset
        await expect(card.expiryDateField).toBeVisible();

        // Card seen as invalid
        cardValid = await page.evaluate('window.component.isValid');
        await expect(cardValid).toEqual(false);
    });

    test('#2 Validating fields first should see visible errors and then entering PAN should see errors cleared from state', async ({
        page,
        card
    }) => {
        await card.goto(url);
        await card.pay();

        // Expect errors in UI
        await expect(card.cardNumberErrorElement).toBeVisible();
        await expect(card.cardNumberErrorElement).toHaveText(PAN_ERROR);
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_EMPTY_ERROR);
        await expect(card.cvcErrorElement).toBeVisible();
        await expect(card.cvcErrorElement).toHaveText(CVC_ERROR);

        // Expect errors in state
        let cardErrors: any = await page.evaluate('window.component.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);

        // Fill number to provoke binLookup response
        await card.typeCardNumber(PLCC_NO_LUHN_NO_DATE);

        // Headless test seems to need time for UI reset to register on state
        await page.waitForTimeout(500);

        // Expect card & date errors to be cleared - since the fields were in error because they were empty
        // but now the PAN field is filled and the date field is hidden & so these fields have re-rendered and updated state
        cardErrors = await page.evaluate('window.component.state.errors');
        await expect(cardErrors[ENCRYPTED_CARD_NUMBER]).toBe(null);
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).toBe(null);

        // The cvc field should remain in error since it is required under this card brand's BIN
        await expect(cardErrors[ENCRYPTED_SECURITY_CODE]).not.toBe(null);
    });

    test('#3 Hidden date field in error does not stop card becoming valid', async ({ page, card }) => {
        await card.goto(url);
        // Card out of date
        await card.typeExpiryDate('12/90');

        // Expect error in UI
        await expect(card.expiryDateField).toBeVisible();
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Force blur event to fire on date field
        await card.cardNumberLabelElement.click();

        // Fill number to provoke binLookup response
        await card.typeCardNumber(PLCC_NO_LUHN_NO_DATE);

        // UI reflects that binLookup says expiryDate is hidden
        await expect(card.expiryDateField).not.toBeVisible();
        await expect(card.expiryDateErrorElement).not.toBeVisible();

        // complete fields
        await card.typeCvc(TEST_CVC_VALUE);

        // Card seen as valid (despite date field technically being in error)
        let cardValid = await page.evaluate('window.component.isValid');
        await expect(cardValid).toEqual(true);

        // Expect errors in state to remain
        let cardErrors: any = await page.evaluate('window.component.state.errors');
        await expect(cardErrors[ENCRYPTED_EXPIRY_DATE]).not.toBe(undefined);

        // Clear number
        await card.deleteCardNumber();

        // Errors in UI visible again
        await expect(card.expiryDateField).toBeVisible();
        await expect(card.expiryDateErrorElement).toBeVisible();
        await expect(card.expiryDateErrorElement).toHaveText(DATE_INVALID_ERROR);

        // Card is not valid
        cardValid = await page.evaluate('window.component.isValid');
        await expect(cardValid).toEqual(false);
    });
});
