import { test, expect } from '../../../pages/cards/card.fixture';
import { MAESTRO_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';
import LANG from '../../../../lib/src/language/locales/en-US.json';

const CVC_LABEL = LANG['creditCard.securityCode.label'];
const CVC_LABEL_OPTIONAL = LANG['creditCard.securityCode.label.optional'];

test.describe('Testing branding - especially regarding optional and hidden cvc fields', () => {
    test(
        '#1 Test for generic card icon & required CVC field' +
            'then enter number recognised as maestro (by our regEx), ' +
            'then add digit so it will be seen as a bcmc card (by our regEx) ,' +
            'then delete number (back to generic card)',
        async ({ cardBrandingPage }) => {
            const { card, page } = cardBrandingPage;

            await card.isComponentVisible();

            // generic card
            let brandingIconSrc = await card.brandingIcon.getAttribute('src');
            await expect(brandingIconSrc).toContain('nocard.svg');

            // visible & required cvc field
            await expect(card.cvcField).toBeVisible();
            await expect(card.cvcField).toHaveClass(/adyen-checkout__field__cvc/); // Note: "relaxed" regular expression to detect one class amongst several that are set on the element
            await expect(card.cvcField).not.toHaveClass(/adyen-checkout__field__cvc--optional/);

            // with regular text
            await expect(card.cvcLabelText).toHaveText(CVC_LABEL);

            // Partially fill card field with digits that will be recognised as maestro
            await card.typeCardNumber('670');

            // maestro card icon
            brandingIconSrc = await card.brandingIcon.getAttribute('src');
            await expect(brandingIconSrc).toContain('maestro.svg');

            // with "optional" text
            await expect(card.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);
            // and optional class
            await expect(card.cvcField).toHaveClass(/adyen-checkout__field__cvc--optional/);

            // Add digit so card is recognised as bcmc
            await card.cardNumberInput.press('End'); /** NOTE: how to add text at end */
            await card.typeCardNumber('3');

            // bcmc card icon
            brandingIconSrc = await card.brandingIcon.getAttribute('src');
            await expect(brandingIconSrc).toContain('bcmc.svg');

            // hidden cvc field
            await expect(card.cvcField).not.toBeVisible();

            // Delete number
            await card.deleteCardNumber();

            // Card is reset
            brandingIconSrc = await card.brandingIcon.getAttribute('src');
            await expect(brandingIconSrc).toContain('nocard.svg');

            // Visible cvc field
            await expect(card.cvcField).toBeVisible();

            // with regular text
            await expect(card.cvcLabelText).toHaveText(CVC_LABEL);

            // and required cvc field
            await expect(card.cvcField).toHaveClass(/adyen-checkout__field__cvc/);
            await expect(card.cvcField).not.toHaveClass(/adyen-checkout__field__cvc--optional/);
        }
    );

    test(
        '#2 Test card is valid with maestro details (cvc optional)' + 'then test it is invalid (& brand reset) when number deleted',
        async ({ cardBrandingPage }) => {
            const { card, page } = cardBrandingPage;

            await card.isComponentVisible();

            // Maestro
            await card.typeCardNumber(MAESTRO_CARD);
            await card.typeExpiryDate(TEST_DATE_VALUE);

            // maestro card icon
            let brandingIconSrc = await card.brandingIcon.getAttribute('src');
            await expect(brandingIconSrc).toContain('maestro.svg');

            // with "optional" text
            await expect(card.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);
            // and optional class
            await expect(card.cvcField).toHaveClass(/adyen-checkout__field__cvc--optional/);

            // Is valid
            let cardValid = await page.evaluate('window.card.isValid');
            await expect(cardValid).toEqual(true);

            await card.typeCvc(TEST_CVC_VALUE);

            // Is valid
            cardValid = await page.evaluate('window.card.isValid');
            await expect(cardValid).toEqual(true);

            // Delete number
            await card.deleteCardNumber();

            // Card is reset to generic card
            brandingIconSrc = await card.brandingIcon.getAttribute('src');
            await expect(brandingIconSrc).toContain('nocard.svg');

            // Is not valid
            cardValid = await page.evaluate('window.card.isValid');
            await expect(cardValid).toEqual(false);
        }
    );

    test(
        '#3 Test card is invalid if filled with maestro details but optional cvc field is left "in error" (partially filled)' +
            'then test it is valid if cvc completed' +
            'then test it is valid if cvc deleted',
        async ({ cardBrandingPage }) => {
            const { card, page } = cardBrandingPage;

            await card.isComponentVisible();

            // Maestro
            await card.typeCardNumber(MAESTRO_CARD);
            await card.typeExpiryDate(TEST_DATE_VALUE);

            // Partial cvc
            await card.typeCvc('73');

            // Force blur event to fire
            await card.cardNumberLabelElement.click();

            // Wait for UI to render
            await page.waitForTimeout(300);

            // Is not valid
            let cardValid = await page.evaluate('window.card.isValid');
            await expect(cardValid).toEqual(false);

            // Complete cvc
            await card.cvcInput.press('End'); /** NOTE: how to add text at end */
            await card.typeCvc('7');

            // Is valid
            cardValid = await page.evaluate('window.card.isValid');
            await expect(cardValid).toEqual(true);

            await card.deleteCvc();

            // Is valid
            cardValid = await page.evaluate('window.card.isValid');
            await expect(cardValid).toEqual(true);
        }
    );
});
