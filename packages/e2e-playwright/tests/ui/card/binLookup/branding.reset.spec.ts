import { test, expect } from '../../../../fixtures/card.fixture';
import { REGULAR_TEST_CARD, UNKNOWN_BIN_CARD_REGEX_VISA } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';

test.describe('Card - Testing resetting brand after binLookup has occurred', () => {
    test('#1 Fill in regular MC card, then replace it with an unrecognised one, but see our regEx detects the brand & sets it in the UI', async ({
        card,
        page
    }) => {
        await card.goto(URL_MAP.card);
        await card.typeCardNumber(REGULAR_TEST_CARD);

        let cardData: any = await page.evaluate('window.component.data');

        // Check brand has been set paymentMethod data
        expect(cardData.paymentMethod.brand).toBe('mc');

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
    });

    test('#2 Fill in regular MC card, then delete it, and see the brand is reset in the UI', async ({ card, page }) => {
        await card.goto(URL_MAP.card);
        await card.typeCardNumber(REGULAR_TEST_CARD);

        await card.deleteCardNumber();

        let cardData: any = await page.evaluate('window.component.data');

        // Check brand has been reset in paymentMethod data
        expect(cardData.paymentMethod.brand).toBe(undefined);

        // Check brand is reset in the UI
        let brandingIconSrc = await card.brandingIcon.getAttribute('src');
        expect(brandingIconSrc).toContain('nocard.svg');
    });
});
