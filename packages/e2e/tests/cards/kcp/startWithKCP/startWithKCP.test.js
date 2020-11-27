import { Selector, ClientFunction } from 'testcafe';
import { start, setIframeSelector } from '../../../utils/commonUtils';
import cu, { getCardIsValid } from '../../utils/cardUtils';
import kcp from '../../utils/kcpUtils';
import { KOREAN_TEST_CARD, REGULAR_TEST_CARD, TEST_TAX_NUMBER_VALUE } from '../../utils/constants';
import { CARDS_URL } from '../../../pages';

const passwordHolder = Selector('.card-field [data-cse="encryptedPassword"]');

const getCardState = ClientFunction((what, prop) => {
    return window.card.state[what][prop];
});

const TEST_SPEED = 1;

const iframeSelector = setIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);
const kcpUtils = kcp(iframeSelector);

fixture`Starting with KCP fields`.page(CARDS_URL).clientScripts('startWithKCP.clientScripts.js');

// Green 1
test(
    'Fill in card number that will hide KCP fields, ' +
        'then check password iframe is hidden, ' +
        'then complete the form & check component becomes valid',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Fill card field with non-korean card
        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

        // Does the password securedField get removed
        await t.expect(passwordHolder.exists).notOk();

        // Complete form
        await cardUtils.fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);
    }
);

// Green 2
test(
    'Fill in all KCP details, ' +
        'then check card state for taxNumber & password entries, ' +
        'then replace card number with non-korean card and check taxNumber and password state are cleared',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Complete form with korean card number
        await cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
        await cardUtils.fillDateAndCVC(t);
        await kcpUtils.fillTaxNumber(t);
        await kcpUtils.fillPwd(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // Expect card state to have tax and pwd elements
        await t.expect(getCardState('data', 'taxNumber')).eql(TEST_TAX_NUMBER_VALUE);
        await t.expect(getCardState('data', 'encryptedPassword')).contains('adyenjs_0_1_'); // check for blob

        await t.expect(getCardState('valid', 'taxNumber')).eql(true);
        await t.expect(getCardState('valid', 'encryptedPassword')).eql(true);

        // Replace number
        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD, true);

        // (Does the password securedField get removed)
        await t.expect(passwordHolder.exists).notOk();

        // Expect card state's tax and pwd elements to have been cleared/reset
        await t.expect(getCardState('data', 'taxNumber')).eql(undefined);
        await t.expect(getCardState('data', 'encryptedPassword')).eql(undefined);

        await t.expect(getCardState('valid', 'taxNumber')).eql(false);
        await t.expect(getCardState('valid', 'encryptedPassword')).eql(false);

        // Expect card to still be valid
        await t.expect(getCardIsValid()).eql(true);
    }
);

// Green 3
test(
    'Fill in card number that will hide KCP fields, ' +
        'then complete form and expect component to be valid & to be able to pay,' +
        'then replace card number with korean card and expect component to be valid & to be able to pay',
    async t => {
        await start(t, 2000, TEST_SPEED);

        // handler for alert that's triggered on successful payment
        await t.setNativeDialogHandler(() => true);

        // Complete form with korean card number
        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        await cardUtils.fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // click pay
        await t
            //            .click('.card-field .adyen-checkout__button--pay') // Can't do this in testing scenario - for some reason it triggers a redirect to a hpp/collectKcpAuthentication page
            // no errors
            .expect(Selector('.adyen-checkout__field--error').exists)
            .notOk();

        // Replace number with non-korean card
        await cardUtils.fillCardNumber(t, KOREAN_TEST_CARD, true);

        // Complete form
        await kcpUtils.fillTaxNumber(t);
        await kcpUtils.fillPwd(t);

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
