import { test } from '@playwright/test';

const getPropFromStateValid = prop => {
    return globalThis.securedFields.state.valid[prop];
};

// Applies to regular, single date field custom card
const iframeSelectorRegular = '.secured-fields iframe';

test.describe('Testing PLCCs, in the custom card component)', () => {
    test.beforeEach(async () => {
        // await t.navigateTo(CUSTOMCARDS_URL);
        // use customcard.plcc.clientScripts.js
    });
    test(
        'Test with a plcc no. that does NOT need a luhn check and see the number become valid ' +
            'then with a plcc no. that DOES need a luhn check but alter last digit so it fails luhn check to ensure the luhn check "reset" has occurred ' +
            'then edit the number to the correct form and see that it passes luhn check and is valid',
        async () => {
            // Start, allow time for iframes to load
            // await start(t, 2000, TEST_SPEED);
            //
            // // Enter num
            // await cardUtilsRegular.fillCardNumber(t, SYNCHRONY_PLCC_NO_LUHN);
            // // num is valid w/o luhn check
            // await t.expect(getPropFromStateValid('encryptedCardNumber')).eql(true);
            //
            // // Enter bin that needs luhn check but replace last digit to one that will mean number fails luhn check
            // const partialNum = SYNCHRONY_PLCC_WITH_LUHN.substr(0, 15);
            // await cardUtilsRegular.fillCardNumber(t, partialNum + '8', 'replace');
            //
            // // num is not valid
            // await t.expect(getPropFromStateValid('encryptedCardNumber')).eql(false);
            //
            // // delete last digit
            // cardUtilsRegular.deleteDigitsFromCardNumber(t, 18, 19);
            //
            // // now enter correct last digit
            // const endNum = SYNCHRONY_PLCC_WITH_LUHN.substr(15, 16);
            // await cardUtilsRegular.fillCardNumber(t, endNum);
            //
            // // num is valid w. luhn check
            // await t.expect(getPropFromStateValid('encryptedCardNumber')).eql(true);
        }
    );

    test(
        'Test with a plcc no. that DOES need a luhn check and see the number become valid ' +
            'then paste a plcc no. that does NOT need a luhn check and see the number become valid because the luhn check "reset" has occurred even after pasting ' +
            'then paste the first number but with an altered last digit that will fail the luhn check and will not be valid because the luhn check "reset" has occurred again' +
            'then edit the number to the correct form and see that it passes luhn check and is valid',
        async () => {
            // Start, allow time for iframes to load
            // await start(t, 2000, TEST_SPEED);
            //
            // // Enter num
            // await cardUtilsRegular.fillCardNumber(t, SYNCHRONY_PLCC_WITH_LUHN);
            // // num is valid
            // await t.expect(getPropFromStateValid('encryptedCardNumber')).eql(true);
            //
            // // Paste num w/o luhn check
            // await cardUtilsRegular.fillCardNumber(t, SYNCHRONY_PLCC_NO_LUHN, 'paste');
            // // num is valid
            // await t.expect(getPropFromStateValid('encryptedCardNumber')).eql(true);
            //
            // // Enter bin that needs luhn check but replace last digit to one that will mean number fails luhn check
            // const partialNum = SYNCHRONY_PLCC_WITH_LUHN.substr(0, 15);
            // await cardUtilsRegular.fillCardNumber(t, partialNum + '8', 'paste');
            // // num is not valid
            // await t.expect(getPropFromStateValid('encryptedCardNumber')).eql(false);
            //
            // // delete last digit
            // cardUtilsRegular.deleteDigitsFromCardNumber(t, 18, 19);
            //
            // // now enter correct last digit
            // const endNum = SYNCHRONY_PLCC_WITH_LUHN.substr(15, 16);
            // await cardUtilsRegular.fillCardNumber(t, endNum);
            //
            // // num is valid w. luhn check
            // await t.expect(getPropFromStateValid('encryptedCardNumber')).eql(true);
        }
    );
});
