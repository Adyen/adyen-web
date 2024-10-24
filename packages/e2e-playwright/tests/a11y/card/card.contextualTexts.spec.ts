import { test, expect } from '../../../fixtures/cards/card.fixture';
import LANG from '../../../../server/translations/en-US.json';
import { AMEX_CARD } from '../../utils/constants';
import { getStoryUrl } from '../../utils/getStoryUrl';
import { URL_MAP } from '../../../fixtures/URL_MAP';

const EXPIRY_DATE_CONTEXTUAL_TEXT = LANG['creditCard.expiryDate.contextualText'];
const CVC_CONTEXTUAL_TEXT_3_DIGITS = LANG['creditCard.securityCode.contextualText.3digits'];
const CVC_CONTEXTUAL_TEXT_4_DIGITS = LANG['creditCard.securityCode.contextualText.4digits'];
const CVC_ERROR = LANG['cc.cvc.920'];

test.describe('Card - Contextual text', () => {
    test('#1 Should inspect the card inputs and see they have contextual elements set', async ({ cardPage }) => {
        await cardPage.goto(URL_MAP.card);

        // checkout expiryDate element
        await expect(cardPage.expiryDateContextualElement).toHaveText(EXPIRY_DATE_CONTEXTUAL_TEXT);
        const expiryDateAriaHidden = await cardPage.expiryDateContextualElement.getAttribute('aria-hidden');
        await expect(expiryDateAriaHidden).toEqual('true');

        // iframe expiryDate element
        await expect(cardPage.expiryDateIframeContextualElement).toHaveText(EXPIRY_DATE_CONTEXTUAL_TEXT);

        // checkout security code contextual element
        await expect(cardPage.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        const cvcAriaHidden = await cardPage.cvcContextualElement.getAttribute('aria-hidden');
        await expect(cvcAriaHidden).toEqual('true');

        // iframe security code element
        await expect(cardPage.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);

        // Type amex number and see the contextual element change in the CVC field
        await cardPage.typeCardNumber(AMEX_CARD);

        await expect(cardPage.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_4_DIGITS);
        await expect(cardPage.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_4_DIGITS);

        // Delete the card number and see the contextual element reset in the CVC field
        await cardPage.deleteCardNumber();

        await expect(cardPage.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        await expect(cardPage.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
    });

    test('#2 Should inspect the cvc input for a contextual text set, then it should be replaced by an error, then reset', async ({
        page,
        cardPage
    }) => {
        await cardPage.goto(URL_MAP.card);
        // checkout security code contextual element
        await expect(cardPage.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        let cvcAriaHidden = await cardPage.cvcContextualElement.getAttribute('aria-hidden');
        await expect(cvcAriaHidden).toEqual('true');

        // error element hidden
        await expect(cardPage.cvcErrorElement).not.toBeVisible();

        // iframe security code contextual element
        await expect(cardPage.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);

        // press pay to generate errors
        await cardPage.pay();

        // checkout security code error element
        await expect(cardPage.cvcErrorElement).toBeVisible();
        await expect(cardPage.cvcErrorElement).toHaveText(CVC_ERROR);
        cvcAriaHidden = await cardPage.cvcErrorElement.getAttribute('aria-hidden');
        await expect(cvcAriaHidden).toEqual('true');

        // contextual element being hidden
        await expect(cardPage.cvcContextualElement).not.toBeVisible();

        // iframe contextual (error) element
        await expect(cardPage.cvcIframeContextualElement).toHaveText(CVC_ERROR);

        // Allow default focusing after validation to happen
        await page.waitForTimeout(1000);

        // type
        await cardPage.typeCvc('737');

        // reset
        await expect(cardPage.cvcContextualElement).toBeVisible();
        await expect(cardPage.cvcContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
        // error element hidden
        await expect(cardPage.cvcErrorElement).not.toBeVisible();

        await expect(cardPage.cvcIframeContextualElement).toHaveText(CVC_CONTEXTUAL_TEXT_3_DIGITS);
    });

    test('#3 Should find no contextualElements because the config says to not show them', async ({ cardPage }) => {
        await cardPage.goto(
            getStoryUrl({
                baseUrl: URL_MAP.card,
                componentConfig: {
                    showContextualElement: false
                }
            })
        );

        // checkout contextual elements not present
        await expect(cardPage.expiryDateContextualElement).not.toBeVisible();
        await expect(cardPage.cvcContextualElement).not.toBeVisible();

        // iframe contextual elements - present but without text
        await expect(cardPage.expiryDateIframeContextualElement).toHaveText('');
        await expect(cardPage.cvcIframeContextualElement).toHaveText('');
    });
});
