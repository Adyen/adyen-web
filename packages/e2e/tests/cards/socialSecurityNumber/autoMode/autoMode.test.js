import { ClientFunction, RequestMock } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../../utils/commonUtils';
import cu from '../../utils/cardUtils';
import { REGULAR_TEST_CARD, TEST_CPF_VALUE } from '../../utils/constants';
import { CARDS_URL, BASE_URL } from '../../../pages';

const getCardState = ClientFunction((what, prop) => {
    return window.card.state[what][prop];
});

const TEST_SPEED = 0.5;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

const fillSSN = async (t, ssnValue = TEST_CPF_VALUE) => {
    return t.switchToMainWindow().typeText('.adyen-checkout__field--socialSecurityNumber input', ssnValue);
};

const requestURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/v2/bin/binLookup?token=${process.env.CLIENT_KEY}`;

const mockedResponse = {
    showSocialSecurityNumber: true,
    brands: [
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            showExpiryDate: true,
            supported: true
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

fixture`Starting with KCP fields`
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
