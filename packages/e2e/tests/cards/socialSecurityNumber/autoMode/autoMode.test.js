import { ClientFunction, RequestMock } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../../utils/commonUtils';
import cu from '../../utils/cardUtils';
import { BIN_LOOKUP_VERSION, REGULAR_TEST_CARD, TEST_CPF_VALUE } from '../../utils/constants';
import { CARDS_URL, BASE_URL } from '../../../pages';

const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

const getCardState = ClientFunction((what, prop) => {
    return window.card.state[what][prop];
});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

const fillSSN = async (t, ssnValue = TEST_CPF_VALUE) => {
    return t.switchToMainWindow().typeText('.adyen-checkout__field--socialSecurityNumber input', ssnValue, { speed: 0.5 });
};

const requestURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/${BIN_LOOKUP_VERSION}/bin/binLookup?token=${process.env.CLIENT_KEY}`;

const mockedResponse = {
    brands: [
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            showExpiryDate: true,
            supported: true,
            showSocialSecurityNumber: true
        }
    ],
    issuingCountryCode: 'BR',
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

fixture`Starting with SSN (auto) field`
    .page(CARDS_URL)
    .clientScripts('autoMode.clientScripts.js')
    .requestHooks(mock);

// Green 1
test('Fill in card number with a socialSecurityNumber (CPF) field (socialSecurityMode: auto)', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Fill card field with non-korean card
    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // Complete form
    await cardUtils.fillDateAndCVC(t);

    await fillSSN(t);

    // Expect card to now be valid
    await t.expect(getIsValid()).eql(true);
});
