import { test, expect } from '../../../fixtures/card.fixture';
import LANG from '../../../../server/translations/en-US.json';
import { AMEX_CARD } from '../../utils/constants';
import { getStoryUrl } from '../../utils/getStoryUrl';
import { URL_MAP } from '../../../fixtures/URL_MAP';

const EXPIRY_DATE_CONTEXTUAL_TEXT = LANG['creditCard.expiryDate.contextualText'];
const CVC_CONTEXTUAL_TEXT_3_DIGITS = LANG['creditCard.securityCode.contextualText.3digits'];
const CVC_CONTEXTUAL_TEXT_4_DIGITS = LANG['creditCard.securityCode.contextualText.4digits'];
const CVC_ERROR = LANG['cc.cvc.920'];
const CVC_ERROR_AMEX = LANG['cc.cvc.920.amex'];

test.describe('Card - Contextual text', () => {
    test('#1 Should inspect the card inputs and see they have contextual elements set', async ({ card }) => {
        await card.goto(URL_MAP.card);

        // checkout expiryDate element
        await expect(card.expiryDateContextualElement).toHaveText(EXPIRY_DATE_CONTEXTUAL_TEXT);
        await expect(card.expiryDateContextualElement).toHaveAttribute('aria-hidden', 'true');

        // iframe expiryDate element
        await expect(card.expiryDateIframeContextualElement).toHaveText(EXPIRY_DATE_CONTEXTUAL_TEXT);

        // checkout security code contextual element
        await expect(card.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        await expect(card.cvcContextualElement).toHaveAttribute('aria-hidden', 'true');

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

    test('#2 Should inspect the cvc input for a contextual text set, then it should be replaced by an error, then reset', async ({ page, card }) => {
        await card.goto(URL_MAP.card);
        // checkout security code contextual element
        await expect(card.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        await expect(card.cvcContextualElement).toHaveAttribute('aria-hidden', 'true');

        // error element hidden
        await expect(card.cvcErrorElement).not.toBeVisible();

        // iframe security code contextual element
        await expect(card.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);

        // press pay to generate errors
        await card.pay();

        // checkout security code error element
        await expect(card.cvcErrorElement).toBeVisible();
        await expect(card.cvcErrorElement).toHaveText(CVC_ERROR);
        await expect(card.cvcErrorElement).toHaveAttribute('aria-hidden', 'true');

        // contextual element being hidden
        await expect(card.cvcContextualElement).not.toBeVisible();

        // iframe contextual (error) element
        await expect(card.cvcIframeContextualElement).toHaveText(CVC_ERROR);

        // Allow default focusing after validation to happen.
        // useSRPanelForCardInputErrors resets isValidating on a 300ms timer; while it is still true any
        // further error change re-triggers ERROR_ACTION_FOCUS_FIELD and steals focus back to the PAN field,
        // which would swallow the digits typed below. There is no DOM signal for that timer.
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

    test('#3 Should show the Amex-specific CVC error (4 digits/front of card) in both the checkout UI and the iframe aria-context element', async ({
        card
    }) => {
        await card.goto(URL_MAP.card);

        // Type an Amex number so the CVC field/iframe switch to the Amex-aware digit count & error copy
        await card.typeCardNumber(AMEX_CARD);

        await expect(card.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_4_DIGITS);
        await expect(card.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_4_DIGITS);

        // press pay to generate errors
        await card.pay();

        // checkout security code error element - shows the Amex-specific text
        await expect(card.cvcErrorElement).toBeVisible();
        await expect(card.cvcErrorElement).toHaveText(CVC_ERROR_AMEX);

        // iframe security code error (aria-context) element - should also show the Amex-specific text
        await expect(card.cvcIframeContextualElement).toHaveText(CVC_ERROR_AMEX);
    });

    test('#4 Should find no contextualElements because the config says to not show them', async ({ card }) => {
        await card.goto(
            getStoryUrl({
                baseUrl: URL_MAP.card,
                componentConfig: {
                    showContextualElement: false
                }
            })
        );

        // checkout contextual elements not present
        await expect(card.expiryDateContextualElement).not.toBeVisible();
        await expect(card.cvcContextualElement).not.toBeVisible();

        // iframe contextual elements - present but without text
        await expect(card.expiryDateIframeContextualElement).toHaveText('');
        await expect(card.cvcIframeContextualElement).toHaveText('');
    });
});
