import { test, expect } from '../../../../../fixtures/card.fixture';
import { CARD_WITH_HEALTHCARE, REGULAR_TEST_CARD } from '../../../../utils/constants';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';

test.describe('Card - onBinLookup healthcare field', () => {
    test.beforeEach(async ({ card, page }) => {
        await card.goto(URL_MAP.card);
        await page.evaluate(() => {
            const w = window as unknown as { component: { onBinLookup: (obj: unknown) => void }; binLookupResult: any };
            const original = w.component.onBinLookup.bind(w.component);
            w.component.onBinLookup = (obj: unknown) => {
                w.binLookupResult = obj;
                original(obj);
            };
        });
    });

    test('should include healthcare in onBinLookup callback when the card is a healthcare card', async ({ card, page }) => {
        await card.typeCardNumber(CARD_WITH_HEALTHCARE);
        await page.waitForFunction('window.binLookupResult');
        const binLookupResult: any = await page.evaluate('window.binLookupResult');
        expect(Array.isArray(binLookupResult.healthcare)).toBe(true);
        expect(binLookupResult.healthcare.some((entry: Record<string, boolean | undefined>) => Object.values(entry)[0] === true)).toBe(true);
    });

    test('should not include healthcare in onBinLookup callback for a regular card', async ({ card, page }) => {
        await card.typeCardNumber(REGULAR_TEST_CARD);
        await page.waitForFunction('window.binLookupResult');
        const binLookupResult: any = await page.evaluate('window.binLookupResult');
        expect(binLookupResult.healthcare).toBeUndefined();
    });
});
