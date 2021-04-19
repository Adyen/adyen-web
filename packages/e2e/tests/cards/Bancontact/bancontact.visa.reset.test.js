import cu from '../utils/cardUtils';

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { RequestMock, Selector } from 'testcafe';
import { start, getIsValid, getIframeSelector } from '../../utils/commonUtils';
import { BASE_URL } from '../../pages';
import { DUAL_BRANDED_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, UNKNOWN_VISA_CARD } from '../utils/constants';

const cvcSpan = Selector('.adyen-checkout__dropin .adyen-checkout__field__cvc');

const brandingIcon = Selector('.adyen-checkout__dropin .adyen-checkout__card__cardNumber__brandIcon');

const dualBrandingIconHolderActive = Selector('.adyen-checkout__payment-method--bcmc .adyen-checkout__card__dual-branding__buttons--active');

const requestURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/v2/bin/binLookup?token=${process.env.CLIENT_KEY}`;

/**
 * NOTE - we are mocking the response until such time as we have the correct BIN in the Test DB
 */
const mockedResponse = {
    brands: [
        {
            brand: 'bcmc',
            cvcPolicy: 'hidden',
            enableLuhnCheck: true,
            showExpiryDate: true,
            supported: true
        },
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            showExpiryDate: true,
            supported: true
        }
    ],
    issuingCountryCode: 'BE',
    requestId: null
};

const mockedNullResponse = {
    requestId: null
};

let sendNullResponse = false;

const mock = RequestMock()
    .onRequestTo(request => {
        return request.url === requestURL && request.method === 'post';
    })
    .respond(
        (req, res) => {
            const body = JSON.parse(req.body);

            if (sendNullResponse === false) {
                mockedResponse.requestId = body.requestId;
                res.setBody(mockedResponse);
                sendNullResponse = true;
            } else {
                mockedNullResponse.requestId = body.requestId;
                res.setBody(mockedNullResponse);
                sendNullResponse = false;
            }
        },
        200,
        {
            'Access-Control-Allow-Origin': BASE_URL
        }
    );

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--bcmc iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing Bancontact in Dropin`
    .page(BASE_URL + '?countryCode=BE')
    .clientScripts('bancontact.clientScripts.js')
    .requestHooks(mock);

test(
    'Enter card number, that we mock to co-branded bcmc/visa ' +
        'then click Visa logo and expect CVC field to show, then' +
        'paste in number not recognised by binLookup (but that internally is recognised as Visa)' +
        'ensure that bcmc logo shows & CVC field is hidden',
    async t => {
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('bcmc')
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('visa');

        // Click Visa brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(1));

        // Visible CVC field
        await t.expect(cvcSpan.filterVisible().exists).ok();

        // Expect iframe to exist in CVC field and with aria-required set to true
        // TODO comment in once sf 3.4.1 is on Test
        //        await t
        //            .switchToIframe(iframeSelector.nth(2))
        //            .expect(Selector('#encryptedSecurityCode').getAttribute('aria-required'))
        //            .eql('true')
        //            .switchToMainWindow();

        await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup

        // Hidden CVC field
        await t.expect(cvcSpan.filterHidden().exists).ok();

        await t
            // bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('bcmc');
    }
);
test.only(
    'Enter card number, that we mock to co-branded bcmc/visa ' +
        'then click Visa logo and expect CVC field to show, then' +
        'delete card number and ' +
        'ensure that bcmc logo shows & CVC field is hidden',
    async t => {
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('bcmc')
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('visa');

        // Click Visa brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(1));

        // Visible CVC field
        await t.expect(cvcSpan.filterVisible().exists).ok();

        // Expect iframe to exist in CVC field and with aria-required set to true
        await t
            .switchToIframe(iframeSelector.nth(2))
            .expect(Selector('#encryptedSecurityCode').getAttribute('aria-required'))
            .eql('true')
            .switchToMainWindow();

        await cardUtils.deleteCardNumber(t);

        // Hidden CVC field
        await t.expect(cvcSpan.filterHidden().exists).ok();

        await t
            // bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('bcmc');
    }
);
