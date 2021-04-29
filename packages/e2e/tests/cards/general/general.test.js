import { Selector } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { CARDS_URL } from '../../pages';
import { REGULAR_TEST_CARD } from '../utils/constants';

const errorHolder = Selector('.card-field .adyen-checkout__field--error');

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');
const cardUtils = cu(iframeSelector);

fixture`Testing regular card completion and payment`.page(CARDS_URL);
//    .clientScripts('general.clientScripts.js');

test('Can fill out the fields in the regular custom card and make a successful payment', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // handler for alert that's triggered on successful payment
    await t.setNativeDialogHandler(() => true);

    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    await cardUtils.fillDateAndCVC(t);

    // click pay
    await t
        .click('.card-field .adyen-checkout__button')
        // no visible errors
        .expect(errorHolder.exists)
        .notOk()
        .wait(1000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});
