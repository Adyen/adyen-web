import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';
import logEvent from '../Services/analytics/log-event';
import { PaymentAmount } from '../../types';
import { createAnalyticsObject } from './utils';
import wait from '../../utils/wait';
import { DEFAULT_DEBOUNCE_TIME_MS } from '../../components/internal/Address/utils';
import { ANALYTICS_EVENT } from './types';

jest.mock('../Services/analytics/collect-id');
jest.mock('../Services/analytics/log-event');

const mockedCollectId = collectId as jest.Mock;
const mockedLogEvent = logEvent as jest.Mock;

const amount: PaymentAmount = { value: 50000, currency: 'USD' };

const mockCheckoutAttemptId = '123456';

const event = {
    containerWidth: 100,
    component: 'card',
    flavor: 'components'
};

const analyticsEventObj = {
    event: 'info' as ANALYTICS_EVENT,
    component: 'cardComponent',
    type: 'Focus',
    target: 'PAN input'
};

describe('Analytics initialisation and event queue', () => {
    const collectIdPromiseMock = jest.fn(() => Promise.resolve(mockCheckoutAttemptId));
    const logEventPromiseMock = jest.fn(() => Promise.resolve(null));

    beforeEach(() => {
        mockedCollectId.mockReset();
        mockedCollectId.mockImplementation(() => collectIdPromiseMock);
        collectIdPromiseMock.mockClear();

        mockedLogEvent.mockReset();
        mockedLogEvent.mockImplementation(() => logEventPromiseMock);
        logEventPromiseMock.mockClear();
    });

    test('Creates an Analytics module with defaultProps', () => {
        const analytics = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });
        expect(analytics.setUp).not.toBe(null);
        expect(analytics.getCheckoutAttemptId).not.toBe(null);
        expect(analytics.getEnabled).not.toBe(null);
        expect(analytics.getEnabled()).toBe(true);
        expect(analytics.createAnalyticsEvent).not.toBe(null);
        expect(analytics.sendAnalytics).not.toBe(null);
        expect(collectIdPromiseMock).toHaveLength(0);
    });

    test('Should not fire any calls if analytics is disabled', () => {
        const analytics = Analytics({ analytics: { enabled: false }, loadingContext: '', locale: '', clientKey: '', amount });

        analytics.setUp(event);
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
        expect(logEventPromiseMock).not.toHaveBeenCalled();
    });

    test('Will not call the collectId endpoint if telemetry is disabled, but will call the logEvent (analytics pixel)', () => {
        const analytics = Analytics({ analytics: { telemetry: false }, loadingContext: '', locale: '', clientKey: '', amount });
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
        analytics.setUp(event);
        expect(collectIdPromiseMock).not.toHaveBeenCalled();

        expect(logEventPromiseMock).toHaveBeenCalledWith({ ...event });
    });

    test('Calls the collectId endpoint by default, adding expected fields', async () => {
        const analytics = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });
        analytics.setUp(event);

        expect(collectIdPromiseMock).toHaveBeenCalled();
        await Promise.resolve(); // wait for the next tick
        expect(collectIdPromiseMock).toHaveBeenCalledWith({ ...event });

        expect(analytics.getCheckoutAttemptId()).toEqual(mockCheckoutAttemptId);
    });

    test('A second attempt to call "send" should fail (since we already have a checkoutAttemptId)', async () => {
        const payload = {
            payloadData: 'test'
        };
        const analytics = Analytics({ analytics: { payload }, loadingContext: '', locale: '', clientKey: '', amount });

        analytics.setUp(event);

        expect(collectIdPromiseMock).toHaveLength(0);
    });

    test('Analytics events queue sends event object', async () => {
        const analytics = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });

        const aObj = createAnalyticsObject(analyticsEventObj);

        expect(aObj.timestamp).not.toBe(undefined);
        expect(aObj.target).toEqual('PAN input');
        expect(aObj.type).toEqual('Focus');

        // no message prop for events
        expect(aObj.message).toBe(undefined);

        analytics.createAnalyticsEvent({ event: 'info', data: aObj });

        // event object should not be sent immediately
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);
    });

    test('Analytics events queue sends error object', async () => {
        const analytics = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });

        const evObj = createAnalyticsObject(analyticsEventObj);
        analytics.createAnalyticsEvent({ event: 'info', data: evObj });

        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);

        const aObj = createAnalyticsObject({
            event: 'error',
            component: 'threeDS2Fingerprint',
            code: 'web_704',
            errorType: 'APIError',
            message: 'threeDS2Fingerprint Missing paymentData property from threeDS2 action'
        });

        expect(aObj.timestamp).not.toBe(undefined);
        expect(aObj.component).toEqual('threeDS2Fingerprint');
        expect(aObj.errorType).toEqual('APIError');
        expect(aObj.message).not.toBe(undefined);

        analytics.createAnalyticsEvent({ event: 'error', data: aObj });

        // error object should be sent almost immediately (after a debounce interval), sending any events as well
        await wait(DEFAULT_DEBOUNCE_TIME_MS);
        expect(analytics.getEventsQueue().getQueue().errors.length).toBe(0);
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(0);
    });

    test('Analytics events queue sends log object', async () => {
        const analytics = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount });

        const aObj = createAnalyticsObject({
            event: 'log',
            component: 'scheme',
            type: 'Submit'
        });

        expect(aObj.timestamp).not.toBe(undefined);
        expect(aObj.component).toEqual('scheme');
        expect(aObj.type).toEqual('Submit');

        // no message prop for a log with type 'Submit'
        expect(aObj.message).toBe(undefined);

        analytics.createAnalyticsEvent({ event: 'log', data: aObj });

        // log object should be sent almost immediately (after a debounce interval)
        await wait(DEFAULT_DEBOUNCE_TIME_MS);
        expect(analytics.getEventsQueue().getQueue().logs.length).toBe(0);
    });
});
