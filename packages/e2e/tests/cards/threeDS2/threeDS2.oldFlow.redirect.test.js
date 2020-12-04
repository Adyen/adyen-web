import { Selector, RequestLogger } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import cu, { getCardIsValid } from '../utils/cardUtils';
import { THREEDS2_FULL_FLOW_CARD } from '../utils/constants';
import { BASE_URL } from '../../pages';

const url = `${BASE_URL}/details`;

const logger = RequestLogger(
    { url, method: 'post' },
    {
        logResponseHeaders: true,
        logResponseBody: true
    }
);

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--card iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing old (v65) 3DS2 Flow (redirect)`
    .page(`${BASE_URL}?amount=12003`)
    .clientScripts('threeDS2.clientScripts.js')
    .requestHooks(logger);

test('Fill in card number that will trigger redirect flow', async t => {
    await start(t, 2000, TEST_SPEED);

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await cardUtils.fillCardNumber(t, THREEDS2_FULL_FLOW_CARD);
    await cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    await t.expect(getCardIsValid('dropin')).eql(true);

    // Click pay
    await t
        .click('.adyen-checkout__card-input .adyen-checkout__button--pay')
        // Expect no errors
        .expect(Selector('.adyen-checkout__field--error').exists)
        .notOk()
        // Allow time for the ONLY details call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok()
        // Allow time for redirect to occur
        .wait(2000);

    // Inspect page for Redirect elements
    await t.expect(Selector('title').innerText).eql('3D Authentication Host');
});
