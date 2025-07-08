import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';
import { PaymentAmount } from '../../types';
import wait from '../../utils/wait';
import { DEFAULT_DEBOUNCE_TIME_MS } from '../../utils/debounce';
import { ANALYTICS_VALIDATION_ERROR_STR } from './constants';
import { AnalyticsInfoEvent } from './AnalyticsInfoEvent';
import { AnalyticsErrorEvent } from './AnalyticsErrorEvent';
import { AnalyticsLogEvent } from './AnalyticsLogEvent';

jest.mock('../Services/analytics/collect-id');

const mockedCollectId = collectId as jest.Mock;

const amount: PaymentAmount = { value: 50000, currency: 'USD' };

const mockCheckoutAttemptId = '123456';

const setUpEvent = {
    containerWidth: 100,
    component: 'card',
    flavor: 'components'
};

const analyticsInfoEventObj = new AnalyticsInfoEvent({
    component: 'cardComponent',
    type: 'Focus',
    target: 'PAN input'
});

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

let analytics;

describe('Analytics initialisation and event queue', () => {
    const collectIdPromiseMock = jest.fn(() => Promise.resolve(mockCheckoutAttemptId));

    beforeEach(() => {
        mockedCollectId.mockReset();
        mockedCollectId.mockImplementation(() => collectIdPromiseMock);
        collectIdPromiseMock.mockClear();

        analytics = Analytics({
            analytics: { payload: { payloadData: 'test' } },
            loadingContext: '',
            locale: '',
            clientKey: '',
            amount,
            bundleType: ''
        });
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

    test('Should still make the setup call even when analytics is disabled, adding expected fields, including sanitising the passed analyticsData object', async () => {
        const checkoutAttemptId = 'my.attempt.id';

        analytics = Analytics({
            analytics: {
                enabled: false,
                analyticsData: {
                    applicationInfo,
                    checkoutAttemptId, // checking that we can also pass in a checkoutAttemptId
                    // @ts-ignore - this is one of the things we're testing (that this object gets stripped out)
                    foo: {
                        bar: 'val'
                    }
                }
            },
            loadingContext: '',
            locale: '',
            clientKey: '',
            bundleType: '',
            amount
        });

        analytics.setUp(setUpEvent);

        expect(collectIdPromiseMock).toHaveBeenCalled();
        await Promise.resolve(); // wait for the next tick

        const enhancedSetupEvent = { ...setUpEvent, applicationInfo, checkoutAttemptId, level: 'initial' };

        expect(collectIdPromiseMock).toHaveBeenCalledWith({ ...enhancedSetupEvent });

        expect(analytics.getCheckoutAttemptId()).toEqual(mockCheckoutAttemptId);
    });

    test('A second attempt to call "send" should fail (since we have retrieved a checkoutAttemptId)', () => {
        void analytics.setUp(setUpEvent);

        expect(collectIdPromiseMock).toHaveLength(0);
    });

    test('Try to create info event but see that it fails because analytics.enabled is false', () => {
        const analytics = Analytics({
            analytics: { enabled: false },
            loadingContext: '',
            locale: '',
            clientKey: '',
            amount,
            bundleType: ''
        });

        const aObj: boolean = analytics.sendAnalytics(analyticsInfoEventObj);

        expect(aObj).toBe(false);

        expect(analytics.getEventsQueue().getQueue().info.length).toBe(0);
    });

    test('With Analytics being enabled by default, create info event and see that it is held in a queue', () => {
        const aObj: boolean = analytics.sendAnalytics(analyticsInfoEventObj);

        expect(aObj).toBe(true);

        // info event should not be sent immediately
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);
    });

    test('Create error event and see that it is sent immediately, also flushing the queued info object', async () => {
        // first create info event
        analytics.sendAnalytics(analyticsInfoEventObj);

        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);

        // create error event
        analytics.sendAnalytics(
            new AnalyticsErrorEvent({
                component: 'threeDS2Fingerprint',
                code: 'web_704',
                errorType: 'APIError',
                message: 'threeDS2Fingerprint Missing paymentData property from threeDS2 action'
            })
        );

        // error object should be sent almost immediately (after a debounce interval), sending any events as well
        await wait(DEFAULT_DEBOUNCE_TIME_MS);
        expect(analytics.getEventsQueue().getQueue().errors.length).toBe(0);
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(0);
    });

    test('Create log event and see that it is sent (almost) immediately', async () => {
        analytics.sendAnalytics(
            new AnalyticsLogEvent({
                component: 'scheme',
                type: 'Submit',
                message: 'shopper clicked pay'
            })
        );

        // log event should be sent almost immediately (after a debounce interval)
        await wait(DEFAULT_DEBOUNCE_TIME_MS);
        expect(analytics.getEventsQueue().getQueue().logs.length).toBe(0);
    });

    test('Creating a validation error info event object and seeing it added to queue', () => {
        analytics.sendAnalytics(
            new AnalyticsInfoEvent({
                component: 'scheme',
                type: ANALYTICS_VALIDATION_ERROR_STR,
                target: 'card_number',
                validationErrorCode: 'cc.num.901',
                validationErrorMessage: 'error-msg-incorrectly-filled-pan'
            })
        );

        // info event should not be sent immediately
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);
    });
});
