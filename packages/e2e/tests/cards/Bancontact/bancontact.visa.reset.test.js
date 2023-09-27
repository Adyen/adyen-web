import cu from '../utils/cardUtils';

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { Selector } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import { BASE_URL } from '../../pages';
import { BCMC_DUAL_BRANDED_VISA, UNKNOWN_VISA_CARD } from '../utils/constants';

const cvcSpan = Selector('.adyen-checkout__dropin .adyen-checkout__field__cvc');

const brandingIcon = Selector('.adyen-checkout__dropin .adyen-checkout__card__cardNumber__brandIcon');

const dualBrandingIconHolderActive = Selector('.adyen-checkout__payment-method--bcmc .adyen-checkout__card__dual-branding__buttons--active');

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--bcmc iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing Bancontact in Dropin`.page(BASE_URL + '?countryCode=BE').clientScripts('bancontact.clientScripts.js');

test(
    '#1 Enter card number, that we mock to co-branded bcmc/visa ' +
        'then click Visa logo and expect CVC field to show, then' +
        'paste in number not recognised by binLookup (but that internally is recognised as Visa)' +
        'ensure that bcmc logo shows & CVC field is hidden',
    async t => {
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value'))
            .eql('bcmc')
            .expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value'))
            .eql('visa');

        // Click Visa brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(1));

        // Visible CVC field
        await t.expect(cvcSpan.filterVisible().exists).ok();

        // Expect iframe to exist in CVC field and with aria-required set to true
        await t
            .switchToIframe(iframeSelector.nth(2))
            .expect(Selector('[data-fieldtype="encryptedSecurityCode"]').getAttribute('aria-required'))
            .eql('true')
            .switchToMainWindow();

        await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup

        // Hidden CVC field
        await t.expect(cvcSpan.filterHidden().exists).ok();

        await t
            // bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('Bancontact card');
    }
);
test(
    '#2 Enter card number, that we mock to co-branded bcmc/visa ' +
        'then click Visa logo and expect CVC field to show, then' +
        'delete card number and ' +
        'ensure that bcmc logo shows & CVC field is hidden',
    async t => {
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value'))
            .eql('bcmc')
            .expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value'))
            .eql('visa');

        // Click Visa brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(1));

        // Visible CVC field
        await t.expect(cvcSpan.filterVisible().exists).ok();

        // Expect iframe to exist in CVC field and with aria-required set to true
        await t
            .switchToIframe(iframeSelector.nth(2))
            .expect(Selector('[data-fieldtype="encryptedSecurityCode"]').getAttribute('aria-required'))
            .eql('true')
            .switchToMainWindow();

        await cardUtils.deleteCardNumber(t);

        // Hidden CVC field
        await t.expect(cvcSpan.filterHidden().exists).ok();

        await t
            // bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('Bancontact card');
    }
);
