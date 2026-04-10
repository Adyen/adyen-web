import dotenv from 'dotenv';
import { test, expect } from '../../../../fixtures/dropin.fixture';
import { MOBILE_USER_AGENT, SMALL_MOBILE_VIEWPORT, TAGS } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { toHaveScreenshot } from '../../../utils/assertions';
import { UPI } from '../../../../models/upi';

dotenv.config();

test.describe('Dropin - Sessions - UPI', () => {
    test.describe('QR Code Flow (Desktop)', () => {
        test('should succeed in making a payment', { tag: [TAGS.SCREENSHOT] }, async ({ dropinWithSession, browserName, page }) => {
            await dropinWithSession.goto(URL_MAP.dropinSessionsIndia);

            const upiPaymentMethodHeader = dropinWithSession.getPaymentMethodHeader('UPI');

            await toHaveScreenshot(upiPaymentMethodHeader.rootElement, browserName, 'upi-payment-method-header-desktop.png');

            await dropinWithSession.selectNonStoredPaymentMethod('upi');

            await toHaveScreenshot(upiPaymentMethodHeader.rootElement, browserName, 'expanded-upi-payment-method-header-desktop.png');

            const upi = new UPI(page);

            await upi.pay({ name: 'Generate QR code' });

            await upi.isQrCodeVisible();
        });
    });

    test.describe('Intent Flow (Mobile)', () => {
        test.use({
            viewport: SMALL_MOBILE_VIEWPORT,
            userAgent: MOBILE_USER_AGENT
        });

        test('should succeed in making a payment', { tag: [TAGS.SCREENSHOT] }, async ({ dropinWithSession, browserName, page }) => {
            await dropinWithSession.goto(URL_MAP.dropinSessionsIndia);

            const upiPaymentMethodHeader = dropinWithSession.getPaymentMethodHeader('UPI');

            await toHaveScreenshot(upiPaymentMethodHeader.rootElement, browserName, 'upi-payment-method-header-mobile.png');

            await dropinWithSession.selectNonStoredPaymentMethod('upi');

            await toHaveScreenshot(upiPaymentMethodHeader.rootElement, browserName, 'expanded-upi-payment-method-header-mobile.png');

            const upi = new UPI(page);

            await upi.selectApp(/google pay/i);

            await upi.pay({ name: 'Continue' });

            await expect(upi.intentArea).not.toBeVisible();
        });
    });
});
