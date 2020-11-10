import { Selector, ClientFunction } from 'testcafe';

import { start } from './commonUtils';

import { fillCardNumber, fillDateAndCVC, fillTaxNumber, fillPwd, deleteCardNumber, checkPwd } from './kcpUtils';

import { KOREAN_TEST_CARD, NON_KOREAN_TEST_CARD, TEST_DATE_VALUE, TEST_CVC_VALUE, TEST_PWD_VALUE, TEST_TAX_NUMBER_VALUE } from './constants';

const cardNumberHolder = Selector('[data-cse="encryptedCardNumber"]');
const passwordHolder = Selector('.card-field [data-cse="encryptedPassword"]');

//const setFocusOn = ClientFunction(who => {
//    window.card.setFocusOn(who);
//});

const getCardIsValid = ClientFunction(() => {
    return window.card.isValid;
});

const getCardState = ClientFunction((what, prop) => {
    return window.card.state[what][prop];
});

fixture`Starting without KCP fields`.page`http://localhost:3020/cards/?testing=testcafe&isKCP=true`;
//fixture`Testing KCP iframes`.page`https://php-71-simon.seamless-checkout.com/components/?testing=testcafe&isKCP=true`;

// Pink 1
test(
    'Fill in card number that will trigger addition of KCP fields, ' +
        'then check new iframe field is correctly set up, ' +
        'then complete the form & check component becomes valid',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, 0.85);

        // Fill card field with korean card
        await fillCardNumber(t, KOREAN_TEST_CARD);

        // Does a newly added password securedField now exist with a state.valid entry, a holder and an iframe...?
        await t
            .expect(getCardState('valid', 'encryptedPassword'))
            .eql(false)
            .expect(passwordHolder.exists)
            .ok()
            .expect(passwordHolder.find('iframe').getAttribute('src'))
            .contains('securedFields.html');

        // ...and can we can type into the iframe?
        await fillPwd(t);

        // Check pwd field for value
        await checkPwd(t, TEST_PWD_VALUE);

        // Complete form
        await fillDateAndCVC(t);
        await fillTaxNumber(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);
    }
);

// Pink 2
test(
    'Fill in card number that will trigger addition of KCP fields, ' +
        'then fill in all KCP details & check card state for taxNumber & password entries, ' +
        'then delete card number and check taxNumber and password state are cleared',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, 0.85);

        // Complete form with korean card number
        await fillCardNumber(t, KOREAN_TEST_CARD);
        await fillDateAndCVC(t);
        await fillTaxNumber(t);
        await fillPwd(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // Expect card state to have tax and pwd elements
        await t.expect(getCardState('data', 'taxNumber')).eql(TEST_TAX_NUMBER_VALUE);
        await t.expect(getCardState('data', 'encryptedPassword')).contains('adyenjs_0_1_'); // check for blob

        await t.expect(getCardState('valid', 'taxNumber')).eql(true);
        await t.expect(getCardState('valid', 'encryptedPassword')).eql(true);

        // Delete number
        await deleteCardNumber(t);

        // Expect card state's tax and pwd elements to have been cleared/reset
        await t.expect(getCardState('data', 'taxNumber')).eql(undefined);
        await t.expect(getCardState('data', 'encryptedPassword')).eql(undefined);

        await t.expect(getCardState('valid', 'taxNumber')).eql(false);
        await t.expect(getCardState('valid', 'encryptedPassword')).eql(false);

        // Expect card to no longer be valid
        await t.expect(getCardIsValid()).eql(false);
    }
);

//test('Fill in card number that will not trigger addition of KCP iframe', async t => {
//    await start(t, 2000, 0.85);
//
//    // Fill card field with korean card
//    await fillCardNumber(t, NON_KOREAN_TEST_CARD);
//
//    // Should be no securedField holding element
//    await t.expect(passwordHolder.exists).notOk();
//});

// Pink 3
test(
    'Fill in card number that will trigger addition of KCP fields, ' +
        'then complete form and expect component to be valid & to be able to pay,' +
        'then replace card number with non-korean card and expect component to be valid & to be able to pay',
    async t => {
        await start(t, 2000, 0.85);

        // handler for alert that's triggered on successful payment
        await t.setNativeDialogHandler(() => true);

        // Complete form with korean card number
        await fillCardNumber(t, KOREAN_TEST_CARD);
        await fillDateAndCVC(t);
        await fillTaxNumber(t);
        await fillPwd(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // click pay
        await t
            .click('.card-field .adyen-checkout__button--pay')
            // no errors
            .expect(Selector('.adyen-checkout__field--error').exists)
            .notOk();

        // Replace number with non-korean card
        await fillCardNumber(t, NON_KOREAN_TEST_CARD, true);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // click pay
        await t
            .click('.card-field .adyen-checkout__button--pay')
            // no errors
            .expect(Selector('.adyen-checkout__field--error').exists)
            .notOk()
            .wait(1000);
    }
);

// Pink 4
test(
    'Fill in card number that will trigger addition of KCP fields, ' +
        'then complete form except for password field,' +
        'expect component not to be valid and for password field to show error',
    async t => {
        await start(t, 2000, 0.85);

        // Complete form with korean card number
        await fillCardNumber(t, KOREAN_TEST_CARD);
        await fillDateAndCVC(t);
        await fillTaxNumber(t);

        // Expect card to not be valid
        await t.expect(getCardIsValid()).eql(false);

        // click pay
        await t
            .click('.card-field .adyen-checkout__button--pay')
            // Expect error on password field
            .expect(Selector('.adyen-checkout__field--koreanAuthentication-encryptedPassword.adyen-checkout__field--error').exists)
            .ok()
            .wait(2000);
    }
);
