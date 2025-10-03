import { test as base, expect } from '../../../../fixtures/base-fixture';
import { THREEDS2_MAESTRO_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import LANG from '../../../../../server/translations/en-US.json';
import { Card } from '../../../../models/card';
import { getStoryUrl } from '../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../fixtures/URL_MAP';

const CVC_LABEL = LANG['creditCard.securityCode.label'];
const CVC_LABEL_OPTIONAL = LANG['creditCard.securityCode.label.optional'];

type Fixture = {
    cardBrandingPage: Card;
};

const test = base.extend<Fixture>({
    cardBrandingPage: async ({ page }, use) => {
        const cardPage = new Card(page);
        const componentConfig = {
            brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc']
        };
        await cardPage.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));
        await use(cardPage);
    }
});

test.describe('Testing branding - especially regarding optional and hidden cvc fields', () => {
    test(
        '#1 Test for generic card icon & required CVC field' +
            'then enter number recognised as maestro (by our regEx), ' +
            'then add digit so it will be seen as a bcmc card (by our regEx) ,' +
            'then delete number (back to generic card)',
        async ({ cardBrandingPage }) => {
            // generic card
            let brandingIconSrc = await cardBrandingPage.brandingIcon.getAttribute('src');
            expect(brandingIconSrc).toContain('nocard.svg');

            // visible & required cvc field
            await expect(cardBrandingPage.cvcField).toBeVisible();
            await expect(cardBrandingPage.cvcField).toHaveClass(/adyen-checkout__field__cvc/); // Note: "relaxed" regular expression to detect one class amongst several that are set on the element
            await expect(cardBrandingPage.cvcField).not.toHaveClass(/adyen-checkout__field__cvc--optional/);

            // with regular text
            await expect(cardBrandingPage.cvcLabelText).toHaveText(CVC_LABEL);

            // Partially fill card field with digits that will be recognised as maestro
            await cardBrandingPage.typeCardNumber('670');

            // maestro card icon
            brandingIconSrc = await cardBrandingPage.brandingIcon.getAttribute('src');
            expect(brandingIconSrc).toContain('maestro.svg');

            // with "optional" text
            await expect(cardBrandingPage.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);
            // and optional class
            await expect(cardBrandingPage.cvcField).toHaveClass(/adyen-checkout__field__cvc--optional/);

            // Add digit so card is recognised as bcmc
            await cardBrandingPage.cardNumberInput.press('End'); /** NOTE: how to add text at end */
            await cardBrandingPage.typeCardNumber('3');

            // bcmc card icon
            brandingIconSrc = await cardBrandingPage.brandingIcon.getAttribute('src');
            expect(brandingIconSrc).toContain('bcmc.svg');

            // hidden cvc field
            await expect(cardBrandingPage.cvcField).not.toBeVisible();

            // Delete number
            await cardBrandingPage.deleteCardNumber();

            // Card is reset
            brandingIconSrc = await cardBrandingPage.brandingIcon.getAttribute('src');
            expect(brandingIconSrc).toContain('nocard.svg');

            // Visible cvc field
            await expect(cardBrandingPage.cvcField).toBeVisible();

            // with regular text
            await expect(cardBrandingPage.cvcLabelText).toHaveText(CVC_LABEL);

            // and required cvc field
            await expect(cardBrandingPage.cvcField).toHaveClass(/adyen-checkout__field__cvc/);
            await expect(cardBrandingPage.cvcField).not.toHaveClass(/adyen-checkout__field__cvc--optional/);
        }
    );

    test(
        '#2 Test card is valid with maestro details (cvc optional)' + 'then test it is invalid (& brand reset) when number deleted',
        async ({ page, cardBrandingPage }) => {
            // Maestro
            await cardBrandingPage.typeCardNumber(THREEDS2_MAESTRO_CARD);
            await cardBrandingPage.typeExpiryDate(TEST_DATE_VALUE);

            // maestro card icon
            let brandingIconSrc = await cardBrandingPage.brandingIcon.getAttribute('src');
            expect(brandingIconSrc).toContain('maestro.svg');

            // with "optional" text
            await expect(cardBrandingPage.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);
            // and optional class
            await expect(cardBrandingPage.cvcField).toHaveClass(/adyen-checkout__field__cvc--optional/);

            // Is valid
            let cardValid = await page.evaluate('window.component.isValid');
            await expect(cardValid).toEqual(true);

            await cardBrandingPage.typeCvc(TEST_CVC_VALUE);

            // Headless test seems to need time for UI reset to register on state
            await page.waitForTimeout(500);

            // Is valid
            cardValid = await page.evaluate('window.component.isValid');
            await expect(cardValid).toEqual(true);

            // Delete number
            await cardBrandingPage.deleteCardNumber();

            // Card is reset to generic card
            brandingIconSrc = await cardBrandingPage.brandingIcon.getAttribute('src');
            await expect(brandingIconSrc).toContain('nocard.svg');

            // Headless test seems to need time for UI change to register on state
            await page.waitForTimeout(500);

            // Is not valid
            cardValid = await page.evaluate('window.component.isValid');
            await expect(cardValid).toEqual(false);
        }
    );

    test(
        '#3 Test card is invalid if filled with maestro details but optional cvc field is left "in error" (partially filled)' +
            'then test it is valid if cvc completed' +
            'then test it is valid if cvc deleted',
        async ({ page, cardBrandingPage }) => {
            // Maestro
            await cardBrandingPage.typeCardNumber(THREEDS2_MAESTRO_CARD);
            await cardBrandingPage.typeExpiryDate(TEST_DATE_VALUE);

            // Partial cvc
            await cardBrandingPage.typeCvc('73');

            // Force blur event to fire
            await cardBrandingPage.cardNumberLabelElement.click();

            // Wait for UI to render
            await page.waitForTimeout(300);

            // Is not valid
            let cardValid = await page.evaluate('window.component.isValid');
            await expect(cardValid).toEqual(false);

            // Complete cvc
            await cardBrandingPage.cvcInput.press('End'); /** NOTE: how to add text at end */
            await cardBrandingPage.typeCvc('7');

            // Is valid
            cardValid = await page.evaluate('window.component.isValid');
            await expect(cardValid).toEqual(true);

            await cardBrandingPage.deleteCvc();

            // Is valid
            cardValid = await page.evaluate('window.component.isValid');
            await expect(cardValid).toEqual(true);
        }
    );
});
