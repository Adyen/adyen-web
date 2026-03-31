import { Page } from '@playwright/test';
import dotenv from 'dotenv';
import { test, expect } from '../../../../fixtures/dropin.fixture';
import {
    API_VERSION,
    CARD_HEADER_LABEL,
    MOBILE_USER_AGENT,
    PAYMENT_RESULT,
    REGULAR_TEST_CARD,
    SMALL_MOBILE_VIEWPORT,
    TAGS,
    TEST_CVC_VALUE,
    TEST_DATE_VALUE
} from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { Card } from '../../../../models/card';
import { toHaveScreenshot } from '../../../utils/assertions';

dotenv.config();

const SCREENSHOT_PAYMENT_NAME = CARD_HEADER_LABEL.toLowerCase().split(' ').join('-');

test.describe('Dropin - Sessions - Cards', () => {
    test('#1 Should succeed in making a payment', { tag: [TAGS.SCREENSHOT] }, async ({ dropinWithSession, browserName, page }) => {
        await dropinWithSession.goto(URL_MAP.dropinWithSession);

        const cardPaymentMethodHeader = dropinWithSession.getPaymentMethodHeader(CARD_HEADER_LABEL);

        await toHaveScreenshot(cardPaymentMethodHeader.rootElement, browserName, `${SCREENSHOT_PAYMENT_NAME}-payment-method-item.png`);

        const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

        const card = new Card(page, paymentMethodDetailsLocator);
        await card.isComponentVisible();

        await toHaveScreenshot(cardPaymentMethodHeader.rootElement, browserName, `expanded-${SCREENSHOT_PAYMENT_NAME}-payment-method-item.png`);

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // check if this UI has a11y errors after card being filled
        expect(await dropinWithSession.getA11yErrors()).toHaveLength(0);

        await dropinWithSession.pay();
        await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.success);
    });

    test.describe('Mobile', () => {
        test.use({
            viewport: SMALL_MOBILE_VIEWPORT,
            userAgent: MOBILE_USER_AGENT
        });

        test('#2 Should succeed in making a payment', { tag: [TAGS.SCREENSHOT] }, async ({ dropinWithSession, browserName, page }) => {
            await dropinWithSession.goto(URL_MAP.dropinWithSession);

            const cardPaymentMethodHeader = dropinWithSession.getPaymentMethodHeader(CARD_HEADER_LABEL);

            await toHaveScreenshot(cardPaymentMethodHeader.rootElement, browserName, `${SCREENSHOT_PAYMENT_NAME}-payment-method-item-mobile.png`);

            const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

            const card = new Card(page, paymentMethodDetailsLocator);
            await card.isComponentVisible();

            await toHaveScreenshot(
                cardPaymentMethodHeader.rootElement,
                browserName,
                `expanded-${SCREENSHOT_PAYMENT_NAME}-payment-method-item-mobile.png`
            );

            await card.typeCardNumber(REGULAR_TEST_CARD);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.typeCvc(TEST_CVC_VALUE);

            // check if this UI has a11y errors after card being filled
            expect(await dropinWithSession.getA11yErrors()).toHaveLength(0);

            await dropinWithSession.pay();
            await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.success);
        });
    });

    if (API_VERSION >= 70) {
        test('#3 Should succeed in making a zeroAuth payment since there is no conflicting configuration on the session', async ({
            dropinWithSession,
            page
        }) => {
            await dropinWithSession.goto(URL_MAP.dropinSessions_zeroAuthCard_success);
            const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

            const card = new Card(page, paymentMethodDetailsLocator);

            await card.isComponentVisible();
            await card.typeCardNumber(REGULAR_TEST_CARD);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.typeCvc(TEST_CVC_VALUE);

            // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
            await dropinWithSession.saveDetails();

            await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.detailsSaved);
        });

        test('#4 Should fail in making a zeroAuth payment since there is conflicting configuration on the session', async ({
            dropinWithSession,
            page
        }) => {
            await dropinWithSession.goto(URL_MAP.dropinSessions_zeroAuthCard_fail);

            const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');
            const card = new Card(page, paymentMethodDetailsLocator);

            await card.isComponentVisible();
            await card.typeCardNumber(REGULAR_TEST_CARD);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.typeCvc(TEST_CVC_VALUE);

            // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
            await dropinWithSession.saveDetails();

            await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.fail);
        });
    } else {
        test(`Skipping tests #2 & #3 for Dropin Sessions flow since api version is too low (v${API_VERSION})`, async t => {});
    }
});
