import { expect, test } from '../../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { BCMC_CARD, BCMC_DUAL_BRANDED_VISA, REGULAR_TEST_CARD, UNKNOWN_BIN_CARD_REGEX_VISA } from '../../../../utils/constants';

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc']
};

test.describe('Card - Testing resetting after binLookup has given a dual brand result', () => {
    test(
        '#1 Fill in dual branded card then to see dual brand UI (icons & buttons) appear' +
            'check that only generic logo shows after deleting digits, and there is no dual brand UI',
        async ({ card, page }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.fillCardNumber(BCMC_CARD);

            // Dual brand icons holder visible
            await expect(card.dualBrandingIconsHolder).toBeVisible();

            // Expect dual brand buttons to be visible
            await expect(card.dualBrandingButtonsHolder).toBeVisible();

            await card.deleteCardNumber();

            // Expect card to have one, generic, icon in the PAN field
            await card.waitForVisibleDualBrandIcons(1);

            let [firstBrand, secondBrand] = await card.dualBrandIcons;

            // Now only a single, generic, brand
            const brandingIconSrc = await firstBrand.getAttribute('src');
            expect(brandingIconSrc).toContain('nocard.svg');

            expect(secondBrand).toBeUndefined();

            // Dual brand icon holder hidden
            await expect(card.dualBrandingIconsHolder).not.toBeVisible();

            // Expect dual brand buttons hidden
            await expect(card.dualBrandingButtonsHolder).not.toBeVisible();
        }
    );

    test('#2 Fill in dual branded card, make selections and see that brand is set, then delete digits and see that brand is reset', async ({
        card,
        page
    }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

        // Check brand has been set, by default, in paymentMethod data
        await page.waitForFunction(() => window['component'].data.paymentMethod.brand === 'bcmc');

        // Click second brand (visa)
        const [, secondButton] = await card.dualBrandingButtonElements;

        await card.getDualBrandButtonImage(secondButton).click();

        // Check brand has been set in paymentMethod data
        await page.waitForFunction(() => window['component'].data.paymentMethod.brand === 'visa');

        // Delete number
        await card.deleteCardNumber();

        // Check brand has been reset in paymentMethod data
        await page.waitForFunction(() => window['component'].data.paymentMethod.brand === undefined);
    });

    test(
        '#3 Fill in dual branded card, automatically sets brand in state, ' +
            ' then replace it with an unrecognised card, see that state is reset, but that our regEx detects the brand & sets it in the UI',
        async ({ card, page }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));
            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            // Check brand has been set in paymentMethod data
            await page.waitForFunction(() => window['component'].data.paymentMethod.brand === 'bcmc');

            // Need this - it allows time for the UI to update when the icon changes
            const responsePromise = page.waitForResponse(response => response.url().includes('/binLookup') && response.request().method() === 'POST');

            // Paste in card unrecognised by /binLookuo but which our regEx recognises as Visa
            await card.fillCardNumber(UNKNOWN_BIN_CARD_REGEX_VISA);

            await responsePromise;

            // Check brand has been reset in paymentMethod data
            await page.waitForFunction(() => window['component'].data.paymentMethod.brand === undefined);

            // Check regEx recognises brand
            let brandingIconSrc = await card.brandingIcon.getAttribute('src');
            expect(brandingIconSrc).toContain('visa.svg');
        }
    );
});
