import { ClientFunction } from 'testcafe';

import { fillIFrame, getInputSelector } from '../../utils/commonUtils';
import { GIFTCARD_NUMBER, GIFTCARD_PIN } from '../utils/constants';
import { GIFTCARDS_SESSIONS_URL } from '../../pages';
import { mock, noCallbackMock, loggers, MOCK_SESSION_DATA } from './onOrderCreated.mocks';

import { GiftCardSessionPage } from '../../_models/GiftCardComponent.page';

const giftCard = new GiftCardSessionPage();
const { setupLogger, balanceLogger, ordersLogger } = loggers;

const getCallBackData = ClientFunction(() => window.onOrderCreatedTestData);

// only setup the loggers for the endpoints so we can setup different responses for different scenarios
fixture`Testing gift cards`.page(GIFTCARDS_SESSIONS_URL).requestHooks([setupLogger, balanceLogger, ordersLogger]);

// set up request hooks for different scenarios
test.requestHooks([mock])('Test if orderStatus is retrieved on success', async t => {
    // Wait for el to appear in DOM
    await t
        .expect(setupLogger.count(() => true))
        .eql(1)
        .expect(
            setupLogger.contains(record => {
                const { sessionData } = JSON.parse(record.request.body);
                return sessionData === MOCK_SESSION_DATA;
            })
        )
        .ok('setup API call has the expected sessionData value');

    await giftCard.pmHolder();

    await giftCard.cardUtils.fillCardNumber(t, GIFTCARD_NUMBER);
    await fillIFrame(t, giftCard.iframeSelector, 1, getInputSelector('encryptedSecurityCode'), GIFTCARD_PIN);

    await t
        .click(giftCard.payButton)
        .expect(balanceLogger.count(() => true))
        .eql(1)
        .expect(
            balanceLogger.contains(record => {
                const { sessionData } = JSON.parse(record.request.body);
                return sessionData === MOCK_SESSION_DATA;
            })
        )
        .ok()
        .expect(ordersLogger.count(() => true))
        .eql(1)
        .expect(getCallBackData())
        .ok();
});

// set up request hooks for different scenarios
test.requestHooks([noCallbackMock])('Test if onOrderCreated is not called if giftcard has enough balance for the payment', async t => {
    await giftCard.cardUtils.fillCardNumber(t, GIFTCARD_NUMBER);
    await fillIFrame(t, giftCard.iframeSelector, 1, getInputSelector('encryptedSecurityCode'), GIFTCARD_PIN);

    await t.click(giftCard.payButton).expect(getCallBackData()).notOk();
});
