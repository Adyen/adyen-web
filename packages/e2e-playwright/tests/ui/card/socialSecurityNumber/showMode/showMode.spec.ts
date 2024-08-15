import { test } from '@playwright/test';
import { TEST_CPF_VALUE } from '../../../../utils/constants';

const passwordHolder = '.card-field [data-cse="encryptedPassword"]';

const getCardState = (what, prop) => {
    return globalThis.card.state[what][prop];
};

const iframeSelector = '.card-field iframe';

const fillSSN = async (t, ssnValue = TEST_CPF_VALUE) => {
    return t.switchToMainWindow().typeText('.adyen-checkout__field--socialSecurityNumber input', ssnValue, { speed: 0.5 });
};

test.describe('Starting with SSN (show) field', () => {
    test.beforeEach(async () => {
        // use mock: mockedResponse for requestURL
        // await t.navigateTo(cardPage.pageUrl);
        //use showMode.clientScripts.js
    });

    test('Fill in card number with a socialSecurityNumber (CPF) field (socialSecurityMode: show)', async t => {
        // Start, allow time for iframes to load
        // await start(t, 2000, TEST_SPEED);
        //
        // // Fill card field with non-korean card
        // await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        //
        // // Does the password securedField get removed
        // await t.expect(passwordHolder.exists).notOk();
        //
        // // Complete form
        // await cardUtils.fillDateAndCVC(t);
        //
        // await fillSSN(t);
        //
        // // Expect card to now be valid
        // await t.expect(getIsValid()).eql(true);
    });

    test('Fill in card number with a wrong socialSecurityNumber (CPF) field (socialSecurityMode: show)', async t => {
        // Start, allow time for iframes to load
        // await start(t, 2000, TEST_SPEED);
        //
        // // Fill card field with non-korean card
        // await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        //
        // // Does the password securedField get removed
        // await t.expect(passwordHolder.exists).notOk();
        //
        // // Complete form
        // await cardUtils.fillDateAndCVC(t);
        //
        // await fillSSN(t, '1234');
        //
        // // Expect card to now be valid
        // await t.expect(getIsValid()).eql(false);
    });
});
