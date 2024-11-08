import { test } from '@playwright/test';
import { BIN_LOOKUP_VERSION } from '../../../../utils/constants';

const brandingIcon = '.card-field .adyen-checkout__card__cardNumber__brandIcon';
const requestURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/${BIN_LOOKUP_VERSION}/bin/binLookup?token=${process.env.CLIENT_KEY}`;

/**
 * NOTE - we are mocking the response until such time as we have a genuine card,
 * that's not in our local RegEx, that returns the properties we want to test
 */
// use the mock on requestURL, POST
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

const iframeSelector = '.card-field iframe';

test.describe('Testing a PLCC, as detected by a mock/binLookup, for a response that should indicate luhn check is not required)', () => {
    // use mock, use plcc.clientScripts.js config
    test('Test plcc card becomes valid with number that fails luhn check ', async () => {
        // Start, allow time for iframes to load
        // generic card
        // await t.expect(brandingIcon.getAttribute('src')).contains('nocard.svg');
        //
        // // Unknown card
        // await cardUtils.fillCardNumber(t, FAILS_LUHN_CARD);
        //
        // await t
        //     // bcmc card icon
        //     .expect(brandingIcon.getAttribute('src'))
        //     .contains('bcmc.svg');
        //
        // // Fill cvc
        // await cardUtils.fillDateAndCVC(t);
        //
        // // Is valid
        // await t.expect(getIsValid('card')).eql(true);
        //
        // // Delete number
        // await cardUtils.deleteCardNumber(t);
        //
        // // Card is reset
        // await t
        //     // generic card icon
        //     .expect(brandingIcon.getAttribute('src'))
        //     .contains('nocard.svg');
        //
        // await t.expect(getIsValid('card')).eql(false);
    });
});
