import { Selector } from 'testcafe';
import { getIframeSelector, getIsValid, start } from '../../utils/commonUtils';
import { REGULAR_TEST_CARD } from '../utils/constants';
import cu from '../utils/cardUtils';
import { CARDS_URL } from '../../pages';

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);
const mockAddress = {
    city: 'Cupertino',
    country: 'US',
    houseNumberOrName: '1',
    postalCode: '90210',
    stateOrProvince: 'CA',
    street: 'Infinite Loop'
};

fixture`Testing Card with AVS`.page(CARDS_URL).clientScripts('avs.clientScripts.js');
// DONE
test('Fill in card with AVS', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Fill card field with non-korean card
    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // Complete form
    await cardUtils.fillDateAndCVC(t);

    // Fill billing address
    await t
        .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__button'))
        .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__list').child(1))
        .typeText('.adyen-checkout__input--street', mockAddress.street)
        .typeText('.adyen-checkout__input--houseNumberOrName', mockAddress.houseNumberOrName)
        .typeText('.adyen-checkout__input--city', mockAddress.city)
        .typeText('.adyen-checkout__input--postalCode', mockAddress.postalCode)
        .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__button'))
        .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__list').child(1));

    // Expect card to now be valid
    await t.expect(getIsValid()).eql(true);
});

test('Fill in card with AVS with an optional field', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Fill card field with non-korean card
    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // Complete form
    await cardUtils.fillDateAndCVC(t);

    // Fill billing address
    await t
        .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__button'))
        .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__list').child(1))
        .typeText('.adyen-checkout__input--street', mockAddress.street)
        .typeText('.adyen-checkout__input--city', mockAddress.city)
        .typeText('.adyen-checkout__input--postalCode', mockAddress.postalCode)
        .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__button'))
        .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__list').child(1));

    // Expect card to now be valid
    await t.expect(getIsValid()).eql(true);
});

test('Switch between addresses with different formats', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Fill card field with non-korean card
    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // Complete form
    await cardUtils.fillDateAndCVC(t);

    // Fill billing address
    await t
        .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__button'))
        .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__list').child(1))
        .typeText('.adyen-checkout__input--street', mockAddress.street)
        .typeText('.adyen-checkout__input--city', mockAddress.city)
        .typeText('.adyen-checkout__input--postalCode', mockAddress.postalCode)
        .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__button'))
        .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__list').child(0));

    // Expect card to now be valid
    await t.expect(getIsValid()).eql(true);

    // Switch country to NL
    await t
        .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__button'))
        .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__list').child(0));

    // Expect card to now be invalid
    await t.expect(getIsValid()).eql(false);

    // Expect to not have a State field
    await t.expect(Selector('.adyen-checkout__field--stateOrProvince').exists).notOk();
});
