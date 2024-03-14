import { test, expect } from '../../../pages/dropin/dropin.fixture';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';

import LANG from '../../../../lib/src/language/locales/en-US.json';

const CARD_IFRAME_TITLE = LANG['creditCard.encryptedCardNumber.aria.iframeTitle'];
const EXPIRY_DATE_IFRAME_TITLE = LANG['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];

const CARD_IFRAME_LABEL = LANG['creditCard.cardNumber.label'];
const EXPIRY_DATE_IFRAME_LABEL = LANG['creditCard.expiryDate.label'];
const CVC_IFRAME_LABEL = LANG['creditCard.securityCode.label'];

test.describe('Dropin Sessions zero-auth flow', () => {
    test('#1 Should', async ({ dropinSessions_zeroAuthCard }) => {
        const { dropin, page } = dropinSessions_zeroAuthCard;

        await dropin.isComponentVisible();

        const creditCard = dropin.getPaymentMethodItem('Cards');
        await creditCard.scrollIntoViewIfNeeded();

        await page.waitForTimeout(500); // needs this else card number isn't guaranteed to fill correctly !?

        await dropin.typeIntoSecuredField(creditCard, CARD_IFRAME_TITLE, CARD_IFRAME_LABEL, REGULAR_TEST_CARD);
        await dropin.typeIntoSecuredField(creditCard, CVC_IFRAME_TITLE, CVC_IFRAME_LABEL, TEST_CVC_VALUE);
        await dropin.typeIntoSecuredField(creditCard, EXPIRY_DATE_IFRAME_TITLE, EXPIRY_DATE_IFRAME_LABEL, TEST_DATE_VALUE);

        await dropinSessions_zeroAuthCard.saveDetails();

        //
        await expect(page.locator('#result-message')).toHaveText('Authorised');
        // await expect(page.locator('#result-message')).toHaveText(
        //     /NETWORK_ERROR: Field 'storePaymentMethod' overrides 'enableRecurring' and 'enableOneClick'. Please provide either one./
        // );
        // await page.waitForTimeout(15000);
    });
});
