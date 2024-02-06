import { Selector } from 'testcafe';
import { DROPIN_SESSIONS_URL } from '../pages';
import { mock, loggers, MOCK_SESSION_DATA } from './dropinSessions.mocks';
import { getIframeSelector } from '../utils/commonUtils';
import cu from '../cards/utils/cardUtils';
import { TEST_CVC_VALUE } from '../cards/utils/constants';

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--scheme iframe');
const cardUtils = cu(iframeSelector);
const { setupLogger, paymentLogger } = loggers;

fixture`Testing Drop-in (Sessions)`.page(DROPIN_SESSIONS_URL).requestHooks([mock, setupLogger, paymentLogger]);

test('Submit the payment using the expected sessionData as payload and sessionID as URL parameter', async t => {
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

    await cardUtils.fillCVC(t, TEST_CVC_VALUE, 'add', 0);

    const payButton = Selector('button.adyen-checkout__button--pay');

    await t
        .click(payButton)
        .expect(paymentLogger.count(() => true))
        .eql(1)
        .expect(
            paymentLogger.contains(record => {
                const { sessionData } = JSON.parse(record.request.body);
                return sessionData === MOCK_SESSION_DATA;
            })
        )
        .ok('payment API call has the expected sessionData value');
});
