import { ClientFunction } from 'testcafe';

import { fillIFrame, getInputSelector } from '../../utils/commonUtils';
import { GIFTCARD_NUMBER, GIFTCARD_PIN } from '../utils/constants';
import { GIFTCARDS_SESSIONS_URL } from '../../pages';
import { mock, loggers, MOCK_SESSION_DATA, balanceMock } from './onRequiringConfirmation.mocks';

import { GiftCardSessionPage } from '../../_models/GiftCardComponent.page';

const giftCard = new GiftCardSessionPage();
const { balanceLogger, ordersLogger, paymentLogger } = loggers;

const getCallBackData = ClientFunction(() => window.onRequiringConfirmationTestData);

// only setup the loggers for the endpoints so we can setup different responses for different scenarios
fixture`Testing gift cards`.page(GIFTCARDS_SESSIONS_URL).requestHooks([balanceLogger, ordersLogger, paymentLogger]);

// set up request hooks for different scenarios
test.requestHooks([balanceMock, mock])('Test if onRequiringConfirmation is retrieved on success', async t => {
    await giftCard.pmHolder();
    await giftCard.cardUtils.fillCardNumber(t, GIFTCARD_NUMBER);
    await fillIFrame(t, giftCard.iframeSelector, 1, getInputSelector('encryptedSecurityCode'), GIFTCARD_PIN);

    // first step, request confirmation (.balanceCheck())
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
        .eql(0)
        .expect(getCallBackData())
        .ok();

    // second step, make payment (.submit())
    await t
        .click(giftCard.payButton)
        .expect(paymentLogger.count(() => true))
        .eql(1);
});
