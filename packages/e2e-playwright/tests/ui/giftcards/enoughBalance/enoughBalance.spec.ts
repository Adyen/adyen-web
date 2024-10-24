import { test } from '@playwright/test';
/* Mock used:
const mock = RequestMock()
    .onRequestTo('http://localhost:3020/paymentMethods/balance')
    .respond({
        balance: { currency: 'USD', value: 999999 }
    })
    .onRequestTo('http://localhost:3020/payments')
    .respond({
        resultCode: 'Authorised'
    });
    */

test('Should prompt a confirmation when using a gift card with enough balance', async t => {
    // Wait for gift card to appear in DOM
    // await giftCard.cardUtils.fillCardNumber(t, GIFTCARD_NUMBER);
    // await fillIFrame(t, giftCard.iframeSelector, 1, getInputSelector('encryptedSecurityCode'), GIFTCARD_PIN);
    //await t.click(giftCard.payButton).expect(giftCard.balanceDisplay.exists).ok();
});
