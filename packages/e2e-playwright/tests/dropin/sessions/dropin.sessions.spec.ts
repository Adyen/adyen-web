import dotenv from 'dotenv';
import { test, expect } from '../../../pages/dropin/dropin.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';
import { typeIntoSecuredField } from '../../../models/utils';

import LANG from '../../../../server/translations/en-US.json';

const CARD_IFRAME_TITLE = LANG['creditCard.encryptedCardNumber.aria.iframeTitle'];
const EXPIRY_DATE_IFRAME_TITLE = LANG['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];

const CARD_IFRAME_LABEL = LANG['creditCard.cardNumber.label'];
const EXPIRY_DATE_IFRAME_LABEL = LANG['creditCard.expiryDate.label'];
const CVC_IFRAME_LABEL = LANG['creditCard.securityCode.label'];
dotenv.config();

test.describe('Dropin Sessions flow', () => {
    test('#1 Should succeed in making a payment', async ({ dropinSessions_regular }) => {
        const { dropin, page } = dropinSessions_regular;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItemByType('scheme');
        await creditCard.scrollIntoViewIfNeeded();

        await page.waitForTimeout(500); // needs this else card number isn't guaranteed to fill correctly !?

        await typeIntoSecuredField(creditCard, CARD_IFRAME_TITLE, CARD_IFRAME_LABEL, REGULAR_TEST_CARD);
        await typeIntoSecuredField(creditCard, CVC_IFRAME_TITLE, CVC_IFRAME_LABEL, TEST_CVC_VALUE);
        await typeIntoSecuredField(creditCard, EXPIRY_DATE_IFRAME_TITLE, EXPIRY_DATE_IFRAME_LABEL, TEST_DATE_VALUE);

        await dropinSessions_regular.pay();

        await expect(page.locator('#result-message')).toHaveText('Authorised');
    });

    test('#2 Should succeed in making a zeroAuth payment since there is no conflicting configuration on the session', async ({
        dropinSessions_zeroAuthCard_success
    }) => {
        test.skip(
            ['v68', 'v69'].includes(process.env.API_VERSION),
            `Skipping test because api version ${process.env.API_VERSION} does not support the feature`
        );

        const { dropin, page } = dropinSessions_zeroAuthCard_success;
        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItemByType('scheme');
        await creditCard.scrollIntoViewIfNeeded();

        await page.waitForTimeout(500);

        await typeIntoSecuredField(creditCard, CARD_IFRAME_TITLE, CARD_IFRAME_LABEL, REGULAR_TEST_CARD);
        await typeIntoSecuredField(creditCard, CVC_IFRAME_TITLE, CVC_IFRAME_LABEL, TEST_CVC_VALUE);
        await typeIntoSecuredField(creditCard, EXPIRY_DATE_IFRAME_TITLE, EXPIRY_DATE_IFRAME_LABEL, TEST_DATE_VALUE);

        // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
        await dropinSessions_zeroAuthCard_success.saveDetails();

        await expect(page.locator('#result-message')).toHaveText('Authorised');
    });

    test('#3 Should fail in making a zeroAuth payment since there is conflicting configuration on the session', async ({
        dropinSessions_zeroAuthCard_fail
    }) => {
        test.skip(
            ['v68', 'v69'].includes(process.env.API_VERSION),
            `Skipping test because api version ${process.env.API_VERSION} does not support the feature`
        );

        const { dropin, page } = dropinSessions_zeroAuthCard_fail;
        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItemByType('scheme');
        await creditCard.scrollIntoViewIfNeeded();

        await page.waitForTimeout(500);

        await typeIntoSecuredField(creditCard, CARD_IFRAME_TITLE, CARD_IFRAME_LABEL, REGULAR_TEST_CARD);
        await typeIntoSecuredField(creditCard, CVC_IFRAME_TITLE, CVC_IFRAME_LABEL, TEST_CVC_VALUE);
        await typeIntoSecuredField(creditCard, EXPIRY_DATE_IFRAME_TITLE, EXPIRY_DATE_IFRAME_LABEL, TEST_DATE_VALUE);

        await dropinSessions_zeroAuthCard_fail.saveDetails();

        await expect(page.locator('#result-message')).toHaveText(
            /NETWORK_ERROR: Field 'storePaymentMethod' overrides 'enableRecurring' and 'enableOneClick'. Please provide either one./
        );
    });
});
