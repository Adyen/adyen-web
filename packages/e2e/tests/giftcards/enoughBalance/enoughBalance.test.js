import { Selector, RequestMock } from 'testcafe';
import { start, fillIFrame, getIframeSelector } from '../../utils/commonUtils';
import { GIFTCARD_NUMBER, GIFTCARD_PIN } from '../utils/constants';
import { GIFTCARDS_URL } from '../../pages';
const TEST_SPEED = 1;

const mock = RequestMock()
    .onRequestTo('http://localhost:3024/paymentMethods/balance')
    .respond({
        balance: { currency: 'USD', value: 999999 }
    })
    .onRequestTo('http://localhost:3024/payments')
    .respond({
        resultCode: 'Authorised'
    });

const iframeSelector = getIframeSelector('.card-field iframe');

fixture`Testing gift cards`
    .page(GIFTCARDS_URL)
    //    .clientScripts('enoughBalance.clientScripts.js')
    .requestHooks(mock);

test('Should prompt a confirmation when using a gift card with enough balance', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Fill card field with dual branded card (visa/cb)
    await fillIFrame(t, iframeSelector, 0, '#encryptedCardNumber', GIFTCARD_NUMBER);
    await fillIFrame(t, iframeSelector, 1, '#encryptedSecurityCode', GIFTCARD_PIN);

    await t
        .click('.card-field .adyen-checkout__button--pay')
        .expect(Selector('.adyen-checkout__giftcard-result__balance').exists)
        .ok();
});
