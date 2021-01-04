import { Selector } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { CARDS_URL } from '../../pages';
import { MAESTRO_CARD, TEST_DATE_VALUE, TEST_CVC_VALUE, BCMC_CARD } from '../utils/constants';

const cvcSpan = Selector('.card-field .adyen-checkout__field__cvc');
const optionalCVCSpan = Selector('.card-field .adyen-checkout__field__cvc--optional');
const cvcLabel = Selector('.card-field .adyen-checkout__label__text');
const brandingIcon = Selector('.card-field .adyen-checkout__card__cardNumber__brandIcon');

//const getPropFromPMData = ClientFunction(prop => {
//    return window.card.formatData().paymentMethod[prop];
//});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing branding - especially regarding optional and hidden cvc fields`.page(CARDS_URL).clientScripts('branding.clientScripts.js');

test(
    'Test for generic card icon, ' +
        'then enter number recognised as maestro, ' +
        'then add digit so it will be seen as a bcmc card ,' +
        'then delete number (back to generic card)',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        await t
            // generic card icon
            .expect(brandingIcon.getAttribute('src'))
            .contains('nocard.svg')

            // visible cvc field
            .expect(cvcSpan.filterVisible().exists)
            .ok()

            // with regular text
            .expect(cvcLabel.withExactText('CVC / CVV').exists)
            .ok()

            // and not optional
            .expect(optionalCVCSpan.exists)
            .notOk();

        // Partially fill card field with digits that will be recognised as maestro
        await cardUtils.fillCardNumber(t, '670');

        await t
            // maestro card icon
            .expect(brandingIcon.getAttribute('src'))
            .contains('maestro.svg')

            // with "optional" text
            .expect(cvcLabel.withExactText('CVC / CVV (optional)').exists)
            .ok()
            // and optional class
            .expect(optionalCVCSpan.exists)
            .ok();

        await t.wait(500);

        // Add digit so card is recognised as bcmc
        await cardUtils.fillCardNumber(t, '3');

        await t
            // bcmc icon
            .expect(brandingIcon.getAttribute('src'))
            .contains('bcmc.svg')

            // hidden cvc field
            .expect(cvcSpan.filterHidden().exists)
            .ok();

        await t.wait(500);

        // Delete number
        await cardUtils.deleteCardNumber(t);

        // Card is reset
        await t
            // generic card icon
            .expect(brandingIcon.getAttribute('src'))
            .contains('nocard.svg')

            // visible cvc field
            .expect(cvcSpan.filterVisible().exists)
            .ok()

            // with regular text
            .expect(cvcLabel.withExactText('CVC / CVV').exists)
            .ok()

            // and not optional
            .expect(optionalCVCSpan.exists)
            .notOk();
    }
);

test('Test card is valid with maestro details (cvc optional) ' + 'then test it is invalid (& brand reset) when number deleted', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // generic card
    await t.expect(brandingIcon.getAttribute('src')).contains('nocard.svg');

    // Maestro
    await cardUtils.fillCardNumber(t, MAESTRO_CARD);
    await cardUtils.fillDate(t, TEST_DATE_VALUE);

    await t
        // maestro card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('maestro.svg');

    await t.expect(getIsValid('card')).eql(true);

    // add cvc
    await cardUtils.fillCVC(t, TEST_CVC_VALUE);

    await t.expect(getIsValid('card')).eql(true);

    // Delete number
    await cardUtils.deleteCardNumber(t);

    // Card is reset
    await t
        // generic card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('nocard.svg');

    await t.expect(getIsValid('card')).eql(false);
});

test('Test card is valid with bcmc details (no cvc) ' + 'then test it is invalid (& brand reset) when number deleted', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // generic card
    await t.expect(brandingIcon.getAttribute('src')).contains('nocard.svg');

    // Maestro
    await cardUtils.fillCardNumber(t, BCMC_CARD);
    await cardUtils.fillDate(t, TEST_DATE_VALUE);

    await t
        // maestro card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('bcmc.svg');

    await t.expect(getIsValid('card')).eql(true);

    // Delete number
    await cardUtils.deleteCardNumber(t);

    // Card is reset
    await t
        // generic card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('nocard.svg');

    await t.expect(getIsValid('card')).eql(false);
});
