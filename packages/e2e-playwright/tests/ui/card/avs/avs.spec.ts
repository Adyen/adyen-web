import { test } from '../../../../fixtures/base-fixture';

const iframeSelector = '.card-field iframe';

const mockAddress = {
    city: 'Cupertino',
    country: 'US',
    houseNumberOrName: '1',
    postalCode: '90210',
    stateOrProvince: 'CA',
    street: 'Infinite Loop'
};

test.describe('Card with AVS', () => {
    test.beforeEach(async () => {
        // await t.navigateTo(CARDS_URL);
        // use avs.clientScripts.js
    });

    test('Fill in card with AVS', async () => {
        // Start, allow time for iframes to load
        // await start(t, 2000, TEST_SPEED);
        //
        // // Fill card field with non-korean card
        // await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        //
        // // Complete form
        // await cardUtils.fillDateAndCVC(t);
        //
        // // Fill billing address
        // await t
        //   .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__button'))
        //   .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__list').child(1))
        //   .typeText('.adyen-checkout__input--street', mockAddress.street)
        //   .typeText('.adyen-checkout__input--houseNumberOrName', mockAddress.houseNumberOrName)
        //   .typeText('.adyen-checkout__input--city', mockAddress.city)
        //   .typeText('.adyen-checkout__input--postalCode', mockAddress.postalCode)
        //   .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__button'))
        //   .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__list').child(1));
        //
        // // Expect card to now be valid
        // await t.expect(getIsValid()).eql(true);
    });

    test('Fill in card with AVS with an optional field', async () => {
        // Start, allow time for iframes to load
        // await start(t, 2000, TEST_SPEED);
        //
        // // Fill card field with non-korean card
        // await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        //
        // // Complete form
        // await cardUtils.fillDateAndCVC(t);
        //
        // // Fill billing address
        // await t
        //   .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__button'))
        //   .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__list').child(1))
        //   .typeText('.adyen-checkout__input--street', mockAddress.street)
        //   .typeText('.adyen-checkout__input--city', mockAddress.city)
        //   .typeText('.adyen-checkout__input--postalCode', mockAddress.postalCode)
        //   .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__button'))
        //   .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__list').child(1));
        //
        // // Expect card to now be valid
        // await t.expect(getIsValid()).eql(true);
    });

    test('Switch between addresses with different formats', async () => {
        // Start, allow time for iframes to load
        // await start(t, 2000, TEST_SPEED);
        //
        // // Fill card field with non-korean card
        // await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        //
        // // Complete form
        // await cardUtils.fillDateAndCVC(t);
        //
        // // Fill billing address
        // await t
        //   .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__button'))
        //   .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__list').child(1))
        //   .typeText('.adyen-checkout__input--street', mockAddress.street)
        //   .typeText('.adyen-checkout__input--city', mockAddress.city)
        //   .typeText('.adyen-checkout__input--postalCode', mockAddress.postalCode)
        //   .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__button'))
        //   .click(Selector('.adyen-checkout__field--stateOrProvince .adyen-checkout__dropdown__list').child(0));
        //
        // // Expect card to now be valid
        // await t.expect(getIsValid()).eql(true);
        //
        // // Switch country to NL
        // await t
        //   .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__button'))
        //   .click(Selector('.adyen-checkout__field--country .adyen-checkout__dropdown__list').child(0));
        //
        // // Expect card to now be invalid
        // await t.expect(getIsValid()).eql(false);
        //
        // // Expect to not have a State field
        // await t.expect(Selector('.adyen-checkout__field--stateOrProvince').exists).notOk();
    });
});
