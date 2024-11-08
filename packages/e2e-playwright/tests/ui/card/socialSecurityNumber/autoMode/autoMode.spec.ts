import { test } from '@playwright/test';
import { BIN_LOOKUP_VERSION, TEST_CPF_VALUE } from '../../../../utils/constants';

const getCardState = (what, prop) => globalThis.component.state[what][prop];
const iframeSelector = '.card-field iframe';

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

test.describe('Starting with SSN (auto) field', () => {
    test.beforeEach(async () => {
        // use mock: mockedResponse for requestURL
        // await t.navigateTo(cardPage.pageUrl);
        //use autoMode.clientScripts.js
    });

    test('Fill in card number with a socialSecurityNumber (CPF) field (socialSecurityMode: auto)', async () => {
        // Start, allow time for iframes to load
        // await start(t, 2000, TEST_SPEED);
        //
        // // Fill card field with non-korean card
        // await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        //
        // // Complete form
        // await cardUtils.fillDateAndCVC(t);
        //
        // await fillSSN(t);
        //
        // // Expect card to now be valid
        // await t.expect(getIsValid()).eql(true);
    });
});
