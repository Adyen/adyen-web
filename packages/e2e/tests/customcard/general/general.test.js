import { Selector } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import cu from '../../cards/utils/cardUtils';
import ccu from '../utils/customCardUtils';
import { CUSTOMCARDS_URL } from '../../pages';
import { REGULAR_TEST_CARD, TEST_MONTH_VALUE, TEST_YEAR_VALUE, TEST_CVC_VALUE } from '../../cards/utils/constants';

const TEST_SPEED = 1;

// Applies to regular, single date field custom card
const iframeSelectorRegular = getIframeSelector('.secured-fields iframe');
const cardUtilsRegular = cu(iframeSelectorRegular);

// Applies to custom card with separate date fields
const iframeSelectorSeparate = getIframeSelector('.secured-fields-2 iframe');
const cardUtilsSeparate = cu(iframeSelectorSeparate);
const customCardUtils = ccu(iframeSelectorSeparate);

fixture`Testing Custom Cards completion and payment`.page(CUSTOMCARDS_URL);
//    .clientScripts('general.clientScripts.js');

test('Can fill out the fields in the regular custom card and make a successful payment', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // handler for alert that's triggered on successful payment
    await t.setNativeDialogHandler(() => true);

    await cardUtilsRegular.fillCardNumber(t, REGULAR_TEST_CARD);

    await cardUtilsRegular.fillDateAndCVC(t);

    // click pay
    await t
        .click('.secured-fields .adyen-checkout__button')
        // no visible errors
        .expect(Selector('.pm-form-label__error-text').filterHidden().exists)
        .ok()
        .wait(1000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});

test('Can fill out the fields in the separate custom card and make a successful payment', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // handler for alert that's triggered on successful payment
    await t.setNativeDialogHandler(() => true);

    await cardUtilsSeparate.fillCardNumber(t, REGULAR_TEST_CARD);

    await customCardUtils.fillMonth(t, TEST_MONTH_VALUE);
    await customCardUtils.fillYear(t, TEST_YEAR_VALUE);

    await customCardUtils.fillCVC(t, TEST_CVC_VALUE);

    // click pay
    await t
        .click('.secured-fields-2 .adyen-checkout__button')
        // no visible errors
        .expect(Selector('.pm-form-label__error-text').filterHidden().exists)
        .ok()
        .wait(1000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});
