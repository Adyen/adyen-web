import { test } from '@playwright/test';
import LANG from '../../../../../server/translations/en-US.json';

const CARD_TOO_OLD = LANG['cc.dat.912'];
const CARD_TOO_FAR = LANG['cc.dat.913'];
const CARD_EXPIRES_BEFORE = LANG['cc.dat.914'];

// todo: original test file for reference: https://github.com/Adyen/adyen-web/blob/main/packages/e2e/tests/cards/expiryDate/minimumExpiryDate.test.js
// use config:
// window.cardConfig = {
//   type: 'scheme',
//   brands: ['mc', 'visa', 'amex', 'synchrony_plcc'],
//   minimumExpiryDate: '09/24'
// };
// description: Testing setting minimumExpiryDate - that it is recognised but doesn't override the other checks on date for a card being too old or too far in the future

test('#1 With minimumExpiryDate set - input an expiry date that is too old & expect the correct error ', async () => {
    // wait for the Date element to present
    // fillDate(t, '12/20');
    // Test UI shows "Card too old" error: CARD_TOO_OLD
});

test('#2 With minimumExpiryDate set - input an expiry date that is 1 month before it & expect the correct error', async () => {
    // wait for the Date element to present
    // fillDate(t, '08/24');
    // Test UI shows "Card expires before..." error - CARD_EXPIRES_BEFORE
});

test('#3 With minimumExpiryDate set - input an expiry date that is matches it & expect no error ', async () => {
    // wait for the Date element to present
    // fillDate(t, '09/24');
    // Test UI shows no error
});

test('#4 With minimumExpiryDate set - input an expiry date that exceeds it (a bit) & expect no error', async () => {
    // wait for the Date element to present
    // fillDate(t, '04/25');
    // Test UI shows no error
});

test('#5 With minimumExpiryDate set - input an expiry date that is too far in the future, & expect the correct error ', async () => {
    // wait for the Date element to present
    // fillDate(t, '12/90');
    // Test UI shows "Card too far in the future" error - CARD_TOO_FAR
});

test(
    '#6 General "date edit" bug: with minimumExpiryDate set - input an expiry date that is matches it & expect no error ' +
        'then edit the date to be before the minimumExpiryDate and expect that to register as an error',
    async () => {
        // wait for the Date element to present
        // fillDate(t, '09/24');
        // Test UI shows no error
        // paste new date: await cardUtils.fillDate(t, '08/24', 'paste');
        // Test UI shows "Card expires before..." error - CARD_EXPIRES_BEFORE
    }
);

test(
    '#7 General "date edit" bug: input a valid expiry date & expect no error ' +
        'then edit the date to be before invalid and expect that to immediately register as an error',
    async () => {
        // wait for the Date element to present
        // fillDate(t, '04/30');
        // Test UI shows no error
        // paste new date cardUtils.fillDate(t, '04/10', 'paste');
        // Test UI shows "Card too old" error- CARD_TOO_OLD
    }
);
