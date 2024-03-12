import { test, expect } from '../../pages/cards/card.fixture';
import { AMEX_CARD } from '../utils/constants';
import LANG from '../../../lib/src/language/locales/en-US.json';

const EXPIRY_DATE_CONTEXTUAL_TEXT = LANG['creditCard.expiryDate.contextualText'];
const CVC_CONTEXTUAL_TEXT_3_DIGITS = LANG['creditCard.securityCode.contextualText.3digits'];
const CVC_CONTEXTUAL_TEXT_4_DIGITS = LANG['creditCard.securityCode.contextualText.4digits'];
const CVC_ERROR = LANG['cc.cvc.920'];

test.describe('Card - Contextual text', () => {
    test('#1 Should inspect the card inputs and see they have contextual elements set', async ({ cardPage }) => {
        const { card, page } = cardPage;

        await card.isComponentVisible();

        // checkout expiryDate element
        await expect(card.expiryDateContextualElement).toHaveText(EXPIRY_DATE_CONTEXTUAL_TEXT);
        const expiryDateAriaHidden = await card.expiryDateContextualElement.getAttribute('aria-hidden');
        await expect(expiryDateAriaHidden).toEqual('true');

        // iframe expiryDate element
        await expect(card.expiryDateIframeContextualElement).toHaveText(EXPIRY_DATE_CONTEXTUAL_TEXT);

        // checkout security code contextual element
        await expect(card.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        const cvcAriaHidden = await card.cvcContextualElement.getAttribute('aria-hidden');
        await expect(cvcAriaHidden).toEqual('true');

        // iframe security code element
        await expect(card.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);

        // Type amex number and see the contextual element change in the CVC field
        await card.typeCardNumber(AMEX_CARD);

        await expect(card.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_4_DIGITS);
        await expect(card.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_4_DIGITS);

        // Delete the card number and see the contextual element reset in the CVC field
        await card.deleteCardNumber();

        await expect(card.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        await expect(card.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
    });

    test('#2 Should inspect the cvc input for a contextual text set, then it should be replaced by an error, then reset', async ({ cardPage }) => {
        const { card, page } = cardPage;

        await card.isComponentVisible();

        // checkout security code contextual element
        await expect(card.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        let cvcAriaHidden = await card.cvcContextualElement.getAttribute('aria-hidden');
        await expect(cvcAriaHidden).toEqual('true');

        // error element hidden
        await expect(card.cvcErrorElement).not.toBeVisible();

        // iframe security code contextual element
        await expect(card.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);

        // press pay to generate errors
        await cardPage.pay();

        // checkout security code error element
        await expect(card.cvcErrorElement).toBeVisible();
        await expect(card.cvcErrorElement).toHaveText(CVC_ERROR);
        cvcAriaHidden = await card.cvcErrorElement.getAttribute('aria-hidden');
        await expect(cvcAriaHidden).toEqual('true');

        // contextual element being hidden
        await expect(card.cvcContextualElement).not.toBeVisible();

        // iframe contextual (error) element
        await expect(card.cvcIframeContextualElement).toHaveText(CVC_ERROR);

        // Allow default focusing after validation to happen
        await page.waitForTimeout(1000);

        // type
        await card.typeCvc('737');

        // reset
        await expect(card.cvcContextualElement).toBeVisible();
        await expect(card.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        // error element hidden
        await expect(card.cvcErrorElement).not.toBeVisible();

        await expect(card.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
    });

    test('#3 Should find no contextualElements because the config says to not show them', async ({ cardNoContextualElementPage }) => {
        const { card, page } = cardNoContextualElementPage;

        await card.isComponentVisible();

        // checkout contextual elements not present
        await expect(card.expiryDateContextualElement).not.toBeVisible();
        await expect(card.cvcContextualElement).not.toBeVisible();

        // iframe contextual elements - present but without text
        await expect(card.expiryDateIframeContextualElement).toHaveText('');
        await expect(card.cvcIframeContextualElement).toHaveText('');
    });
});
