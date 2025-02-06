import { expect, test } from '../../../../fixtures/card.fixture';
import { getStoryUrl } from '../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { BCMC_CARD, BCMC_DUAL_BRANDED_VISA, REGULAR_TEST_CARD, UNKNOWN_BIN_CARD_REGEX_VISA } from '../../../utils/constants';

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc']
};

test.describe('Card - Testing resetting after binLookup has given a dual brand result', () => {
    test(
        '#1 Fill in dual branded card then ' +
            'check that brands have been sorted to place Bcmc first then ' +
            'ensure only generic logo shows after deleting digits',
        async ({ card }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

            await card.fillCardNumber(BCMC_CARD);

            await card.waitForVisibleBrands();

            let [firstBrand, secondBrand] = await card.brands;

            //2 brand icons, in correct order
            expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
            expect(secondBrand).toHaveAttribute('data-value', 'maestro');

            await card.deleteCardNumber();

            await card.waitForVisibleBrands(1);

            [firstBrand, secondBrand] = await card.brands;

            // Now only a single brand
            let brandingIconSrc = await firstBrand.getAttribute('src');
            expect(brandingIconSrc).toContain('nocard.svg');

            expect(secondBrand).toBeUndefined();
        }
    );

    test(
        '#2 Fill in dual branded card, do not make selection and see that brand is not set, ' +
            ' then replace it with an unrecognised one, but see our regEx detects the brand & sets it in the UI',
        async ({ card, page }) => {
            await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));
            await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

            let cardData: any = await page.evaluate('window.component.data');

            // Check brand has not been set in paymentMethod data
            expect(cardData.paymentMethod.brand).toBe(undefined);

            const responsePromise = page.waitForResponse(response => response.url().includes('/binLookup') && response.request().method() === 'POST');

            // Paste in card unrecognised by /binLookuo but which our regEx recognises as Visa
            await card.fillCardNumber(UNKNOWN_BIN_CARD_REGEX_VISA);

            await responsePromise;

            cardData = await page.evaluate('window.component.data');

            // Check brand has been reset in paymentMethod data
            expect(cardData.paymentMethod.brand).toBe(undefined);

            // Check regEx recognises brand
            let brandingIconSrc = await card.brandingIcon.getAttribute('src');
            expect(brandingIconSrc).toContain('visa.svg');
        }
    );

    test('#3 Fill in dual branded card, make selection and see that brand is set, then delete digits and see that brand is reset', async ({
        card,
        page
    }) => {
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));
        await card.typeCardNumber(BCMC_DUAL_BRANDED_VISA);

        // Select brand
        await card.selectBrand(/visa/i);

        let cardData: any = await page.evaluate('window.component.data');

        // Check brand has been set in paymentMethod data
        expect(cardData.paymentMethod.brand).toBe('visa');

        // Click second brand
        await card.selectBrand('Bancontact card');

        cardData = await page.evaluate('window.component.data');

        // Check brand has been set in paymentMethod data
        expect(cardData.paymentMethod.brand).toBe('bcmc');

        // Delete number
        await card.deleteCardNumber();

        cardData = await page.evaluate('window.component.data');

        // Check brand has been reset in paymentMethod data
        expect(cardData.paymentMethod.brand).toBe(undefined);
    });
});
