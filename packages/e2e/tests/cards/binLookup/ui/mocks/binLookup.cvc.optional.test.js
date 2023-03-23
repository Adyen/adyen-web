const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { Selector, RequestMock } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../../../utils/commonUtils';
import cu from '../../../utils/cardUtils';
import { BASE_URL, CARDS_URL } from '../../../../pages';
import { BIN_LOOKUP_VERSION, UNKNOWN_BIN_CARD } from '../../../utils/constants';

const cvcSpan = Selector('.card-field .adyen-checkout__field__cvc');
const optionalCVCSpan = Selector('.card-field .adyen-checkout__field__cvc--optional');
const cvcLabel = Selector('.card-field .adyen-checkout__label__text');
const brandingIcon = Selector('.card-field .adyen-checkout__card__cardNumber__brandIcon');

const requestURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/${BIN_LOOKUP_VERSION}/bin/binLookup?token=${process.env.CLIENT_KEY}`;

/**
 * NOTE - we are mocking the response until such time as we have a genuine card,
 * that's not in our local RegEx, that returns the properties we want to test
 */
const mockedResponse = {
    brands: [
        {
            brand: 'bcmc', // keep as a recognised card brand (bcmc) until we have a genuine card - to avoid logo loading errors
            cvcPolicy: 'optional',
            enableLuhnCheck: true,
            showExpiryDate: true,
            supported: true
        }
    ],
    issuingCountryCode: 'US',
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

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing a card, as detected by a mock/binLookup, for a response that should indicate optional cvc)`
    .page(CARDS_URL)
    .clientScripts('binLookup.mocks.clientScripts.js')
    .requestHooks(mock);

test('Test card has optional cvc field ' + 'then complete date and see card is valid ' + ' then delete card number and see card reset', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    await t
        // generic card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('nocard.svg')

        // visible cvc field
        .expect(cvcSpan.filterVisible().exists)
        .ok()

        // with regular text
        .expect(cvcLabel.withExactText('Security code').exists)
        .ok()

        // and not optional
        .expect(optionalCVCSpan.exists)
        .notOk();

    // Unknown card
    await cardUtils.fillCardNumber(t, UNKNOWN_BIN_CARD);

    await t
        // bcmc card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('bcmc.svg')

        // visible cvc field
        .expect(cvcSpan.filterVisible().exists)
        .ok()

        // with "optional" text
        .expect(cvcLabel.withExactText('Security code (optional)').exists)
        .ok()
        // and optional class
        .expect(optionalCVCSpan.exists)
        .ok();

    // Fill date
    await cardUtils.fillDate(t);

    // Is valid
    await t.expect(getIsValid('card')).eql(true);

    // Delete number
    await cardUtils.deleteCardNumber(t);

    // Card is reset
    await t
        // generic card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('nocard.svg')

        // visible cvc field
        .expect(cvcSpan.filterVisible().exists)
        .ok()

        // with regular text
        .expect(cvcLabel.withExactText('Security code').exists)
        .ok()

        // and not optional
        .expect(optionalCVCSpan.exists)
        .notOk();

    await t.expect(getIsValid('card')).eql(false);
});
