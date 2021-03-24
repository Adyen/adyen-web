import { Selector, ClientFunction } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../../utils/commonUtils';
import cu from '../../utils/cardUtils';
import { REGULAR_TEST_CARD, TEST_CPF_VALUE } from '../../utils/constants';
import { CARDS_URL } from '../../../pages';

const passwordHolder = Selector('.card-field [data-cse="encryptedPassword"]');

const getCardState = ClientFunction((what, prop) => {
    return window.card.state[what][prop];
});

const TEST_SPEED = 0.5;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

const fillSSN = async (t, ssnValue = TEST_CPF_VALUE) => {
    return t.switchToMainWindow().typeText('.adyen-checkout__field--socialSecurityNumber input', ssnValue);
};

fixture`Starting with KCP fields`.page(CARDS_URL).clientScripts('showMode.clientScripts.js');

// Green 1
test.only('Fill in card number with a socialSecurityNumber (CPF) field (socialSecurityMode: show)', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Fill card field with non-korean card
    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // Does the password securedField get removed
    await t.expect(passwordHolder.exists).notOk();

    // Complete form
    await cardUtils.fillDateAndCVC(t);

    await fillSSN(t);

    // Expect card to now be valid
    await t.expect(getIsValid()).eql(true);
});
