import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';
import { PaymentAmount } from '../../types';
import wait from '../../utils/wait';
import { DEFAULT_DEBOUNCE_TIME_MS } from '../../utils/debounce';
import { ANALYTICS_EVENT, AnalyticsObject, CreateAnalyticsObject } from './types';
import { ANALYTICS_VALIDATION_ERROR_STR } from './constants';

jest.mock('../Services/analytics/collect-id');

const mockedCollectId = collectId as jest.Mock;

const amount: PaymentAmount = { value: 50000, currency: 'USD' };

const mockCheckoutAttemptId = '123456';

const setUpEvent = {
    containerWidth: 100,
    component: 'card',
    flavor: 'components'
};

const analyticsEventObj = {
    event: 'info' as ANALYTICS_EVENT,
    component: 'cardComponent',
    type: 'Focus',
    target: 'PAN input'
} as CreateAnalyticsObject;

let analytics;

describe('Analytics initialisation and event queue', () => {
    const collectIdPromiseMock = jest.fn(() => Promise.resolve(mockCheckoutAttemptId));

    beforeEach(() => {
        mockedCollectId.mockReset();
        mockedCollectId.mockImplementation(() => collectIdPromiseMock);
        collectIdPromiseMock.mockClear();

        analytics = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount, bundleType: '' });
    });

    test('Creates an Analytics module with defaultProps', () => {
        expect(analytics.setUp).not.toBe(null);
        expect(analytics.getCheckoutAttemptId).not.toBe(null);
        expect(analytics.getEnabled).not.toBe(null);
        expect(analytics.getEnabled()).toBe(true);
        expect(analytics.createAnalyticsEvent).not.toBe(null);
        expect(analytics.sendAnalytics).not.toBe(null);
        expect(collectIdPromiseMock).toHaveLength(0);
    });

    test('Should not fire any calls if analytics is disabled', () => {
        const analytics = Analytics({ analytics: { enabled: false }, loadingContext: '', locale: '', clientKey: '', amount, bundleType: '' });

        void analytics.setUp(setUpEvent);
        expect(collectIdPromiseMock).not.toHaveBeenCalled();
    });

    test('Calls the collectId endpoint by default, adding expected fields, including sanitising the passed analyticsData object', async () => {
        const applicationInfo = {
            merchantApplication: {
                name: 'merchant_application_name',
                version: 'version'
            },
            externalPlatform: {
                name: 'external_platform_name',
                version: 'external_platform_version',
                integrator: 'getSystemIntegratorName'
            }
        };

        const checkoutAttemptId = 'my.attempt.id';

        analytics = Analytics({
            analytics: {
                analyticsData: {
                    applicationInfo,
                    checkoutAttemptId,
                    // @ts-ignore - this is one of the things we're testing (that this object gets stripped out)
                    foo: {
                        bar: 'val'
                    }
                }
            },
            loadingContext: '',
            locale: '',
            clientKey: '',
            amount
        });

        analytics.setUp(setUpEvent);

        expect(collectIdPromiseMock).toHaveBeenCalled();
        await Promise.resolve(); // wait for the next tick

        const enhancedSetupEvent = { ...setUpEvent, applicationInfo, checkoutAttemptId };

        expect(collectIdPromiseMock).toHaveBeenCalledWith({ ...enhancedSetupEvent });

        expect(analytics.getCheckoutAttemptId()).toEqual(mockCheckoutAttemptId);
    });

    test('A second attempt to call "send" should fail (since we already have a checkoutAttemptId)', () => {
        const payload = {
            payloadData: 'test'
        };
        const analytics = Analytics({ analytics: { payload }, loadingContext: '', locale: '', clientKey: '', amount, bundleType: '' });

        void analytics.setUp(setUpEvent);

        expect(collectIdPromiseMock).toHaveLength(0);
    });

    test('Create info event and see that it is held in a queue', () => {
        const aObj: AnalyticsObject = analytics.createAnalyticsEvent({ event: 'info', data: analyticsEventObj });

        expect(aObj.timestamp).not.toBe(undefined);
        expect(aObj.target).toEqual('PAN input');
        expect(aObj.type).toEqual('Focus');

        // no message prop for info events
        expect(aObj.message).toBe(undefined);

        // info event should not be sent immediately
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);
    });

    test('Create error event and see that it is sent immediately, also flushing the queued info object', async () => {
        // first create info event
        analytics.createAnalyticsEvent({ event: 'info', data: analyticsEventObj });

        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);

        // create error event
        const aObj = analytics.createAnalyticsEvent({
            event: 'error',
            data: {
                // event: 'error',
                component: 'threeDS2Fingerprint',
                code: 'web_704',
                errorType: 'APIError',
                message: 'threeDS2Fingerprint Missing paymentData property from threeDS2 action'
            }
        });

        expect(aObj.timestamp).not.toBe(undefined);
        expect(aObj.component).toEqual('threeDS2Fingerprint');
        expect(aObj.errorType).toEqual('APIError');
        expect(aObj.message).not.toBe(undefined);

        // error object should be sent almost immediately (after a debounce interval), sending any events as well
        await wait(DEFAULT_DEBOUNCE_TIME_MS);
        expect(analytics.getEventsQueue().getQueue().errors.length).toBe(0);
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(0);
    });

    test('Create log event and see that it is sent (almost) immediately', async () => {
        const aObj = analytics.createAnalyticsEvent({
            event: 'log',
            data: {
                component: 'scheme',
                type: 'Submit'
            }
        });

        expect(aObj.timestamp).not.toBe(undefined);
        expect(aObj.component).toEqual('scheme');
        expect(aObj.type).toEqual('Submit');

        // no message prop for a log
        expect(aObj.message).toBe(undefined);

        // log event should be sent almost immediately (after a debounce interval)
        await wait(DEFAULT_DEBOUNCE_TIME_MS);
        expect(analytics.getEventsQueue().getQueue().logs.length).toBe(0);
    });

    test('Creating a validation error info event object with the expected properties', () => {
        const aObj = analytics.createAnalyticsEvent({
            event: 'info',
            data: {
                component: 'scheme',
                type: ANALYTICS_VALIDATION_ERROR_STR,
                target: 'card_number',
                validationErrorCode: 'cc.num.901',
                validationErrorMessage: 'error-msg-incorrectly-filled-pan'
            }
        });

        expect(aObj.timestamp).not.toBe(undefined);
        expect(aObj.target).toEqual('card_number');
        expect(aObj.type).toEqual(ANALYTICS_VALIDATION_ERROR_STR);
        expect(aObj.validationErrorCode).toEqual('901');
        expect(aObj.validationErrorMessage).toEqual('error-msg-incorrectly-filled-pan');

        // info event should not be sent immediately
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);
    });
});
