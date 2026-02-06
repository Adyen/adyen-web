import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { toHaveScreenshot } from '../../../utils/assertions';
import { TAGS } from '../../../utils/constants';

const PAYBYBANK_US_LABEL = 'Pay by Bank';
const PAYBYBANK_US_BRAND_COUNT = 4;

test.describe('Dropin - PayByBankUS brand icons reflow (WCAG 1.4.10)', () => {
    test(
        'should display all brand icons at default viewport width',
        { tag: [TAGS.SCREENSHOT] },
        async ({ dropinWithSession, browserName }) => {
            await dropinWithSession.goto(URL_MAP.dropinWithSession_US);

            const header = dropinWithSession.getPaymentMethodHeader(PAYBYBANK_US_LABEL);
            await header.rootElement.scrollIntoViewIfNeeded();

            const brands = await header.getVisibleCardBrands();
            expect(brands).toHaveLength(PAYBYBANK_US_BRAND_COUNT);

            await toHaveScreenshot(header.rootElement, browserName, 'paybybank-us-brands-default.png');
        }
    );

    test(
        'should display all brand icons at 320px viewport width without hiding any',
        { tag: [TAGS.SCREENSHOT] },
        async ({ dropinWithSession, page, browserName }) => {
            await page.setViewportSize({ width: 320, height: 800 });
            await dropinWithSession.goto(URL_MAP.dropinWithSession_US);

            const header = dropinWithSession.getPaymentMethodHeader(PAYBYBANK_US_LABEL);
            await header.rootElement.scrollIntoViewIfNeeded();

            const brands = await header.getVisibleCardBrands();
            expect(brands).toHaveLength(PAYBYBANK_US_BRAND_COUNT);

            await toHaveScreenshot(header.rootElement, browserName, 'paybybank-us-brands-320px.png');
        }
    );
});
