import { test } from '@playwright/test';
// todo: need to configure the mock
// use mock
test('Test if orderStatus is retrieved on success', async () => {
    // Wait for cardholder el to appear in DOM
    // fillCardNumber(t, GIFTCARD_NUMBER);
    // fill in pin: await fillIFrame(t, giftCard.iframeSelector, 1, getInputSelector('encryptedSecurityCode'), GIFTCARD_PIN);
    // click pay button
    // expect to send correct data to check balance? -> sessionData === MOCK_SESSION_DATA;
    // expect onOrderUpdated callback to pass correct data
});

// use noCallbackMock
test('Test if onOrderCreated is not called if giftcard has enough balance for the payment', async () => {
    // Wait for cardholder el to appear in DOM
    // fillCardNumber(t, GIFTCARD_NUMBER);
    // fill in pin -> await fillIFrame(t, giftCard.iframeSelector, 1, getInputSelector('encryptedSecurityCode'), GIFTCARD_PIN);
    // click pay button
    // expect onOrderUpdated is not called
});
