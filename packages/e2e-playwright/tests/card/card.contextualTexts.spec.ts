import { test, expect } from '../../pages/cards/card.fixture';
// import { test, expect } from '../../pages/cards/card.contextualTexts.fixture';
import { AMEX_CARD } from '../utils/constants';
import LANG from '../../../lib/src/language/locales/en-US.json';

const EXPIRY_DATE_CONTEXTUAL_TEXT = LANG['creditCard.expiryDateField.contextualText'];
const CVC_CONTEXTUAL_TEXT_3_DIGITS = LANG['creditCard.cvcField.contextualText.3digits'];
const CVC_CONTEXTUAL_TEXT_4_DIGITS = LANG['creditCard.cvcField.contextualText.4digits'];

test('Should inspect the card inputs and see they have contextual elements set', async ({ cardPage }) => {
    const { card, page } = cardPage;

    await card.isComponentVisible();

    // checkout expiryDate element
    await expect(card.expiryDateContextualElement).toHaveText(EXPIRY_DATE_CONTEXTUAL_TEXT);
    const expiryDateAriaHidden = await card.expiryDateContextualElement.getAttribute('aria-hidden');
    await expect(expiryDateAriaHidden).toEqual('true');

    // iframe expiryDate element
    await expect(card.expiryDateIframeContextualElement).toHaveText(EXPIRY_DATE_CONTEXTUAL_TEXT);

    // checkout security code element
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
