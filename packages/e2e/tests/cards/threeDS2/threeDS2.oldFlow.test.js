import { Selector, RequestLogger } from 'testcafe';
import { start, setIframeSelector } from '../utils/commonUtils';
import cu, { getCardIsValid } from '../utils/cardUtils';
import { fillChallengeField, submitChallenge } from '../utils/threeDS2Utils';
import { THREEDS2_FRICTIONLESS_CARD, THREEDS2_FULL_FLOW_CARD } from '../utils/constants';
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

const iframeSelector = setIframeSelector('.adyen-checkout__payment-method--card iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing old (v65) 3DS2 Flow`
    .page(BASE_URL)
    .clientScripts('threeDS2.clientScripts.js')
    .requestHooks(logger);

test('Fill in card number that will trigger frictionless flow', async t => {
    await start(t, 2000, TEST_SPEED);

    // Set handler for the alert window
    await t.setNativeDialogHandler(() => true);

    // Fill card fields
    await cardUtils.fillCardNumber(t, THREEDS2_FRICTIONLESS_CARD);
    await cardUtils.fillDateAndCVC(t);

    // Expect card to now be valid
    await t.expect(getCardIsValid('dropin')).eql(true);

    // Click pay
    await t
        .click('.adyen-checkout__card-input .adyen-checkout__button--pay')
        // Expect no errors
        .expect(Selector('.adyen-checkout__field--error').exists)
        .notOk()
        // Allow time for the details call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok()
        // Allow time for the alert to manifest
        .wait(2000);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});

test('Fill in card number that will trigger challenge flow', async t => {
    logger.clear();

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
        // Allow time for the details call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok();

    // console.log(logger.requests[0].response.headers);

    // Complete challenge
    await fillChallengeField(t);
    await submitChallenge(t);

    await t
        // Allow time for the second details call, which we expect to be successful
        .wait(1000)
        .expect(logger.contains(r => r.response.statusCode === 200))
        .ok()
        .wait(2000);

    // console.log(logger.requests[1].response.headers);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
});
