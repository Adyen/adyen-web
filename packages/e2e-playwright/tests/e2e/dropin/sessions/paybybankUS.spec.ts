import { test } from '../../../../fixtures/dropin.fixture';
import { MOBILE_USER_AGENT, SMALL_A11Y_MOBILE_VIEWPORT, TAGS } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { toHaveScreenshot } from '../../../utils/assertions';

test.describe('Dropin - Sessions - PayByBankUS', () => {
    test.describe('Brand list (Small Mobile)', () => {
        test.use({
            viewport: SMALL_A11Y_MOBILE_VIEWPORT,
            userAgent: MOBILE_USER_AGENT
        });

        test(
            'should render all brand icons in the dropin list at 320px width',
            { tag: [TAGS.SCREENSHOT] },
            async ({ dropinWithSession, browserName }) => {
                await dropinWithSession.goto(URL_MAP.dropinWithSession);

                const payByBankHeader = dropinWithSession.getPaymentMethodHeader('Pay by bank');

                await toHaveScreenshot(payByBankHeader.rootElement, browserName, 'paybybankus-payment-method-header-mobile-320.png', {
                    mask: [payByBankHeader.rootElement.locator('img')]
                });
            }
        );
    });
});
