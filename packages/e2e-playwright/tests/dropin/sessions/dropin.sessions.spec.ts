import { test, expect } from '../../../pages/dropin/dropin.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';

import LANG from '../../../../lib/src/language/locales/en-US.json';

const CARD_IFRAME_TITLE = LANG['creditCard.encryptedCardNumber.aria.iframeTitle'];
const EXPIRY_DATE_IFRAME_TITLE = LANG['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];

const CARD_IFRAME_LABEL = LANG['creditCard.cardNumber.label'];
const EXPIRY_DATE_IFRAME_LABEL = LANG['creditCard.expiryDate.label'];
const CVC_IFRAME_LABEL = LANG['creditCard.securityCode.label'];

test.describe('Dropin Sessions flow', () => {
    test('#1 Should succeed in making a payment', async ({ dropinSessions_regular }) => {
        const { dropin, page } = dropinSessions_regular;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItem('Cards');
        await creditCard.scrollIntoViewIfNeeded();

        await page.waitForTimeout(500); // needs this else card number isn't guaranteed to fill correctly !?

        await dropin.typeIntoSecuredField(creditCard, CARD_IFRAME_TITLE, CARD_IFRAME_LABEL, REGULAR_TEST_CARD);
        await dropin.typeIntoSecuredField(creditCard, CVC_IFRAME_TITLE, CVC_IFRAME_LABEL, TEST_CVC_VALUE);
        await dropin.typeIntoSecuredField(creditCard, EXPIRY_DATE_IFRAME_TITLE, EXPIRY_DATE_IFRAME_LABEL, TEST_DATE_VALUE);

        await dropinSessions_regular.pay();

        await expect(page.locator('#result-message')).toHaveText('Authorised');
        // await page.waitForTimeout(15000);
    });

    test('#2 Should succeed in making a zeroAuth payment since there is no conflicting configuration on the session', async ({
        dropinSessions_zeroAuthCard_success
    }) => {
        const { dropin, page } = dropinSessions_zeroAuthCard_success;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItem('Cards');
        await creditCard.scrollIntoViewIfNeeded();

        await page.waitForTimeout(500); // needs this else card number isn't guaranteed to fill correctly !?

        await dropin.typeIntoSecuredField(creditCard, CARD_IFRAME_TITLE, CARD_IFRAME_LABEL, REGULAR_TEST_CARD);
        await dropin.typeIntoSecuredField(creditCard, CVC_IFRAME_TITLE, CVC_IFRAME_LABEL, TEST_CVC_VALUE);
        await dropin.typeIntoSecuredField(creditCard, EXPIRY_DATE_IFRAME_TITLE, EXPIRY_DATE_IFRAME_LABEL, TEST_DATE_VALUE);

        // A payment successfully registered as a zero-auth payment should have a "save details" button instead of "pay"
        await dropinSessions_zeroAuthCard_success.saveDetails();

        await expect(page.locator('#result-message')).toHaveText('Authorised');
    });

    test('#3 Should fail in making a zeroAuth payment since there is conflicting configuration on the session', async ({
        dropinSessions_zeroAuthCard_fail
    }) => {
        const { dropin, page } = dropinSessions_zeroAuthCard_fail;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItem('Cards');
        await creditCard.scrollIntoViewIfNeeded();

        await page.waitForTimeout(500); // needs this else card number isn't guaranteed to fill correctly !?

        await dropin.typeIntoSecuredField(creditCard, CARD_IFRAME_TITLE, CARD_IFRAME_LABEL, REGULAR_TEST_CARD);
        await dropin.typeIntoSecuredField(creditCard, CVC_IFRAME_TITLE, CVC_IFRAME_LABEL, TEST_CVC_VALUE);
        await dropin.typeIntoSecuredField(creditCard, EXPIRY_DATE_IFRAME_TITLE, EXPIRY_DATE_IFRAME_LABEL, TEST_DATE_VALUE);

        await dropinSessions_zeroAuthCard_fail.saveDetails();

        await expect(page.locator('#result-message')).toHaveText(
            /NETWORK_ERROR: Field 'storePaymentMethod' overrides 'enableRecurring' and 'enableOneClick'. Please provide either one./
        );
    });
});
