import { RequestMock } from 'testcafe';
import { fillIFrame, getInputSelector } from '../../utils/commonUtils';
import { GIFTCARD_NUMBER, GIFTCARD_PIN } from '../utils/constants';
import { GIFTCARDS_URL } from '../../pages';

import GiftCardPage from '../../_models/GiftCardComponent.page';

const giftCard = new GiftCardPage();

const mock = RequestMock()
    .onRequestTo('http://localhost:3024/paymentMethods/balance')
    .respond({
        balance: { currency: 'USD', value: 999999 }
    })
    .onRequestTo('http://localhost:3024/payments')
    .respond({
        resultCode: 'Authorised'
    });

fixture`Testing gift cards`.page(GIFTCARDS_URL).requestHooks(mock);

test('Should prompt a confirmation when using a gift card with enough balance', async t => {
    // Wait for el to appear in DOM
    await giftCard.pmHolder();

    await giftCard.cardUtils.fillCardNumber(t, GIFTCARD_NUMBER);
    await fillIFrame(t, giftCard.iframeSelector, 1, getInputSelector('encryptedSecurityCode'), GIFTCARD_PIN);

    await t
        .click(giftCard.payButton)
        .expect(giftCard.balanceDisplay.exists)
        .ok();
});
