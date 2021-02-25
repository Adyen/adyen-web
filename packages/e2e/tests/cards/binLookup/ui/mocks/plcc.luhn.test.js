const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { Selector, RequestMock } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../../../utils/commonUtils';
import cu from '../../../utils/cardUtils';
import { BASE_URL, CARDS_URL } from '../../../../pages';
import { FAILS_LUHN_CARD } from '../../../utils/constants';

const brandingIcon = Selector('.card-field .adyen-checkout__card__cardNumber__brandIcon');

const requestURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/v2/bin/binLookup?token=${process.env.CLIENT_KEY}`;

/**
 * NOTE - we are mocking the response until such time as we have a genuine card,
 * that's not in our local RegEx, that returns the properties we want to test
 */
const mockedResponse = {
    brands: [
        {
            brand: 'bcmc', // keep as a recognised card brand (bcmc) until we have a genuine plcc - to avoid logo loading errors
            cvcPolicy: 'required',
            enableLuhnCheck: false,
            showExpiryDate: true,
            supported: true
        }
    ],
    issuingCountryCode: 'US',
    requestId: null
};

const mock = RequestMock()
    .onRequestTo(requestURL)
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

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing a PLCC, as detected by a mock/binLookup, for a response that should indicate luhn check is not required)`
    .page(CARDS_URL)
    .clientScripts('plcc.clientScripts.js')
    .requestHooks(mock);

test('Test plcc card becomes valid with number that fails luhn check ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // generic card
    await t.expect(brandingIcon.getAttribute('src')).contains('nocard.svg');

    // Unknown card
    await cardUtils.fillCardNumber(t, FAILS_LUHN_CARD);

    await t
        // bcmc card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('bcmc.svg');

    // Fill cvc
    await cardUtils.fillDateAndCVC(t);

    // Is valid
    await t.expect(getIsValid('card')).eql(true);

    // Delete number
    await cardUtils.deleteCardNumber(t);

    // Card is reset
    await t
        // generic card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('nocard.svg');

    await t.expect(getIsValid('card')).eql(false);
});
