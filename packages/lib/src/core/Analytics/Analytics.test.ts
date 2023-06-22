import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';
import logEvent from '../Services/analytics/log-event';
import { PaymentAmountExtended } from '../../types';

jest.mock('../Services/analytics/collect-id');
jest.mock('../Services/analytics/log-event');

const mockedCollectId = collectId as jest.Mock;
const mockedLogEvent = logEvent as jest.Mock;

let amount: PaymentAmountExtended;

describe('Analytics', () => {
    const collectIdPromiseMock = jest.fn(() => Promise.resolve('123456'));
    const logEventPromiseMock = jest.fn(request => Promise.resolve(request));

    const event = {
        containerWidth: 100,
        component: 'card',
        flavor: 'components'
    };

    beforeEach(() => {
        mockedCollectId.mockReset();
        mockedCollectId.mockImplementation(() => collectIdPromiseMock);
        collectIdPromiseMock.mockClear();
        mockedLogEvent.mockReset();
        mockedLogEvent.mockImplementation(() => logEventPromiseMock);
        logEventPromiseMock.mockClear();

        amount = { value: 50000, currency: 'USD' };
    });

    test('Creates an Analytics module with defaultProps', () => {
        const analytics = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });
        expect(analytics.send).not.toBe(null);
        expect(analytics.getCheckoutAttemptId).not.toBe(null);
        expect(analytics.addAnalyticsAction).not.toBe(null);
        expect(analytics.sendAnalyticsActions).not.toBe(null);
        expect(collectIdPromiseMock).toHaveLength(0);
    });

    test('Should not fire any calls if analytics is disabled', () => {
        const analytics = Analytics({ analytics: { enabled: false }, loadingContext: '', locale: '', clientKey: '', amount });

        analytics.send(event);
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
        expect(logEventPromiseMock).not.toHaveBeenCalled();
    });

    test('Will not call the collectId endpoint if telemetry is disabled, but will call the logEvent (analytics pixel)', () => {
        const analytics = Analytics({ analytics: { telemetry: false }, loadingContext: '', locale: '', clientKey: '', amount });
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
        analytics.send(event);
        expect(collectIdPromiseMock).not.toHaveBeenCalled();

        expect(logEventPromiseMock).toHaveBeenCalledWith({ ...event });
    });

    test('Calls the collectId endpoint by default, adding expected fields', async () => {
        const analytics = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });
        analytics.send(event);

        expect(collectIdPromiseMock).toHaveBeenCalled();
        await Promise.resolve(); // wait for the next tick
        expect(collectIdPromiseMock).toHaveBeenCalledWith({ ...event });
    });

    test('A second attempt to call "send" should fail (since we already have a checkoutAttemptId)', async () => {
        const payload = {
            payloadData: 'test'
        };
        const analytics = Analytics({ analytics: { payload }, loadingContext: '', locale: '', clientKey: '', amount });

        analytics.send(event);

        expect(collectIdPromiseMock).toHaveLength(0);
    });
});
