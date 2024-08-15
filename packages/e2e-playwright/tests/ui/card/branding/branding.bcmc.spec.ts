import { test } from '@playwright/test';

test.describe('Testing branding, as detected by /binLookup, for bcmc (hidden cvc field)', () => {
    // use the config:
    // window.cardConfig = {
    //     type: 'scheme',
    //     brands: ['mc', 'visa', 'amex', 'bcmc']
    // };

    test('Test card is valid with bcmc details (no cvc) ' + 'then test it is invalid (& brand reset) when number deleted', async t => {
        // Wait for Card to load
        // expect(brandingIcon.getAttribute('src')).contains('nocard.svg')
        // cardUtils.fillCardNumber(t, BCMC_CARD); BCMC_CARD = '6703444444444449'
        // cardUtils.fillDate(t, TEST_DATE_VALUE); TEST_DATE_VALUE = '03/30';
        // expect bcmc card icon brandingIcon.getAttribute('src') = 'bcmc.svg'
        // expect hidden cvc field
        // expect the card is valid
        // deleteCardNumber
        // Card is reset - expect the branding icon src = 'nocard.svg'
        // expect visible cvc field
        // expect cvc label = Security code
        // expect cvc is NOT optional - optionalCVCSpan does not exist
        // expect the card is NOT valid
    });
});
