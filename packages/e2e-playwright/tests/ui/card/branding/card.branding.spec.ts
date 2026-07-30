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
            brands: ['bcmc', 'mc', 'visa', 'amex', 'maestro']
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
            await expect(cardBrandingPage.brandingIcon).toHaveAttribute('src', /\/nocard\.svg$/);

            // visible & required cvc field
            await expect(cardBrandingPage.cvcField).toBeVisible();
            await expect(cardBrandingPage.cvcField).toHaveClass(/adyen-checkout__field__cvc/); // Note: "relaxed" regular expression to detect one class amongst several that are set on the element
            await expect(cardBrandingPage.cvcField).not.toHaveClass(/adyen-checkout__field__cvc--optional/);

            // with regular text
            await expect(cardBrandingPage.cvcLabelText).toHaveText(CVC_LABEL);

            // Partially fill card field with digits that will be recognised as maestro
            await cardBrandingPage.typeCardNumber('670');

            // maestro card icon
            await expect(cardBrandingPage.brandingIcon).toHaveAttribute('src', /\/maestro\.svg$/);

            // with "optional" text
            await expect(cardBrandingPage.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);
            // and optional class
            await expect(cardBrandingPage.cvcField).toHaveClass(/adyen-checkout__field__cvc--optional/);

            // Add digit so card is recognised as bcmc
            await cardBrandingPage.cardNumberInput.press('End'); /** NOTE: how to add text at end */
            await cardBrandingPage.typeCardNumber('3');

            // bcmc card icon
            await expect(cardBrandingPage.brandingIcon).toHaveAttribute('src', /\/bcmc\.svg$/);

            // hidden cvc field
            await expect(cardBrandingPage.cvcField).not.toBeVisible();

            // Delete number
            await cardBrandingPage.deleteCardNumber();

            // Card is reset
            await expect(cardBrandingPage.brandingIcon).toHaveAttribute('src', /\/nocard\.svg$/);

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
            await expect(cardBrandingPage.brandingIcon).toHaveAttribute('src', /\/maestro\.svg$/);

            // with "optional" text
            await expect(cardBrandingPage.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);
            // and optional class
            await expect(cardBrandingPage.cvcField).toHaveClass(/adyen-checkout__field__cvc--optional/);

            // Is valid
            const cardValid = await page.evaluate('window.component.isValid');
            await expect(cardValid).toEqual(true);

            await cardBrandingPage.typeCvc(TEST_CVC_VALUE);

            // Is valid
            await page.waitForFunction(() => window['component'].isValid === true);

            // Delete number
            await cardBrandingPage.deleteCardNumber();

            // Card is reset to generic card
            await expect(cardBrandingPage.brandingIcon).toHaveAttribute('src', /\/nocard\.svg$/);

            // Is not valid
            await page.waitForFunction(() => window['component'].isValid === false);
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

            // Is not valid
            await page.waitForFunction(() => window['component'].isValid === false);

            // Complete cvc
            await cardBrandingPage.cvcInput.press('End'); /** NOTE: how to add text at end */
            await cardBrandingPage.typeCvc('7');

            // Is valid
            await page.waitForFunction(() => window['component'].isValid === true);

            await cardBrandingPage.deleteCvc();

            // Is valid
            await page.waitForFunction(() => window['component'].isValid === true);
        }
    );
});
