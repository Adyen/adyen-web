import cu from '../utils/cardUtils';

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { RequestMock, Selector } from 'testcafe';
import { start, getIsValid, getIframeSelector } from '../../utils/commonUtils';
import { BASE_URL } from '../../pages';
import { DUAL_BRANDED_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../utils/constants';

const brandsHolder = Selector('.adyen-checkout__payment-method__brands');

const numberSpan = Selector('.adyen-checkout__dropin .adyen-checkout__card__cardNumber__input');
const cvcSpan = Selector('.adyen-checkout__dropin .adyen-checkout__field__cvc');

const dualBrandingIconHolder = Selector('.adyen-checkout__payment-method--bcmc .adyen-checkout__card__dual-branding__buttons');
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

const mock = RequestMock()
    .onRequestTo(request => {
        return request.url === requestURL && request.method === 'post';
    })
    .respond(
        (req, res) => {
            const body = JSON.parse(req.body);
            mockedResponse.requestId = body.requestId;
            res.setBody(mockedResponse);
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

test('Check Bancontact comp is correctly presented at startup', async t => {
    // Start, allow time to load
    await start(t, 2000, TEST_SPEED);

    // Expect 3 card brand logos to be displayed
    await t
        .expect(brandsHolder.exists)
        .ok()
        .expect(
            brandsHolder
                .find('img')
                .nth(0)
                .getAttribute('alt')
        )
        .eql('bcmc')
        .expect(
            brandsHolder
                .find('img')
                .nth(1)
                .getAttribute('alt')
        )
        .eql('maestro')
        .expect(
            brandsHolder
                .find('img')
                .nth(2)
                .getAttribute('alt')
        )
        .eql('visa');

    // Hidden cvc field
    await t.expect(cvcSpan.filterHidden().exists).ok();

    // BCMC logo in number field
    await t
        .expect(numberSpan.exists)
        .ok()
        .expect(
            numberSpan
                .find('img')
                .nth(0)
                .getAttribute('alt')
        )
        .eql('bcmc');
});

test('Entering digits that our local regEx will recognise as Visa does not affect the UI', async t => {
    await start(t, 2000, TEST_SPEED);

    await cardUtils.fillCardNumber(t, '41');

    // BCMC logo still in number field
    await t
        .expect(
            numberSpan
                .find('img')
                .nth(0)
                .getAttribute('alt')
        )
        .eql('bcmc');

    // Hidden cvc field
    await t.expect(cvcSpan.filterHidden().exists).ok();
});

test('Enter card number, that we mock to co-branded bcmc/visa ' + 'then complete expiryDate and expect comp to be valid', async t => {
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

    await cardUtils.fillDate(t, TEST_DATE_VALUE);

    // Expect comp to now be valid
    await t.expect(getIsValid('dropin')).eql(true);
});

test.only(
    'Enter card number, that we mock to co-branded bcmc/visa ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then click BCMC logo and expect comp to be valid again',
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

        await cardUtils.fillDate(t, TEST_DATE_VALUE);

        // Expect comp to now be valid
        await t.expect(getIsValid('dropin')).eql(true);

        // Click Visa brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(1));

        // Visible CVC field
        await t.expect(cvcSpan.filterVisible().exists).ok();

        // Expect iframe to exist in CVC field and with aria-required set to true
        return t
            .switchToIframe(iframeSelector.nth(2))
            .expect(Selector('#encryptedSecurityCode').getAttribute('aria-required'))
            .eql('true')
            .switchToMainWindow();

        // Expect comp not to be valid
        await t.expect(getIsValid('dropin')).eql(false);

        // Click BCMC brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(0));

        // Hidden CVC field
        await t.expect(cvcSpan.filterHidden().exists).ok();

        // Expect comp to be valid
        await t.expect(getIsValid('dropin')).eql(true);
    }
);

test(
    'Enter card number, that we mock to co-branded bcmc/visa ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then enter CVC and expect comp to be valid',
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

        await cardUtils.fillDate(t, TEST_DATE_VALUE);

        // Expect comp to now be valid
        await t.expect(getIsValid('dropin')).eql(true);

        // Click Visa brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(1));

        // Expect comp not to be valid
        await t.expect(getIsValid('dropin')).eql(false);

        // fill CVC
        await cardUtils.fillCVC(t, TEST_CVC_VALUE);

        // Expect comp to now be valid
        await t.expect(getIsValid('dropin')).eql(true);
    }
);
