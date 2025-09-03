import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';
import { PaymentAmount } from '../../types';
import wait from '../../utils/wait';
import { DEFAULT_DEBOUNCE_TIME_MS } from '../../utils/debounce';
import { ANALYTICS_VALIDATION_ERROR_STR } from './constants';
import { AnalyticsInfoEvent } from './AnalyticsInfoEvent';
import { AnalyticsErrorEvent } from './AnalyticsErrorEvent';
import { AnalyticsLogEvent } from './AnalyticsLogEvent';
import { AnalyticsProps } from './types';
import { CheckoutAttemptIdSession } from '../Services/analytics/types';
import Storage from '../../utils/Storage';

jest.mock('../Services/analytics/collect-id');

const mockedCollectId = collectId as jest.Mock;

const amount: PaymentAmount = { value: 50000, currency: 'USD' };

const MOCKED_ATTEMPT_ID = 'xxxx-yyyy-zzzz';

const flushPromises = () => new Promise(process.nextTick);

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
    const collectIdPromiseMock = jest.fn(() => Promise.resolve(MOCKED_ATTEMPT_ID));

    beforeEach(() => {
        mockedCollectId.mockReset();
        mockedCollectId.mockImplementation(() => collectIdPromiseMock);
        collectIdPromiseMock.mockClear();

        analytics = Analytics({
            analytics: { payload: { payloadData: 'test' } },
            locale: '',
            clientKey: '',
            bundleType: '',
            analyticsContext: ''
        });
    });

    test('Creates an Analytics module with defaultProps', () => {
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

        const enhancedSetupEvent = { ...setUpEvent, applicationInfo, checkoutAttemptId, level: 'initial', checkoutStage: 'Checkout' };

        expect(collectIdPromiseMock).toHaveBeenCalledWith({ ...enhancedSetupEvent });

        expect(analytics.getCheckoutAttemptId()).toEqual(MOCKED_ATTEMPT_ID);
    });

    test('Try to create info event but see that it fails because analytics.enabled is false', () => {
        const analytics = Analytics({
            analyticsContext: '',
            analytics: { enabled: false },
            locale: '',
            clientKey: '',
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

describe('Analytics - sendAnalyticsEvents()', () => {
    let collectIdPromiseMock = jest.fn(() => Promise.resolve(MOCKED_ATTEMPT_ID));
    const storage = new Storage<CheckoutAttemptIdSession>('checkout-attempt-id', 'sessionStorage');

    const DEFAULT_ANALYTICS_PROPS: AnalyticsProps = {
        locale: 'en-US',
        clientKey: 'test_client_key',
        analyticsContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
        bundleType: 'umd'
    };

    function setupMocks({ rejectCollectIdPromise }: { rejectCollectIdPromise?: boolean } = {}) {
        collectIdPromiseMock = jest.fn(() => (rejectCollectIdPromise ? Promise.reject() : Promise.resolve(MOCKED_ATTEMPT_ID)));
        mockedCollectId.mockReset();
        mockedCollectId.mockImplementation(() => collectIdPromiseMock);
        collectIdPromiseMock.mockClear();
    }

    beforeEach(() => {
        setupMocks();
        storage.clear();
    });

    test('should send "error" event without the delay', async () => {
        const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
        await analytics.setUp();

        expect(collectIdPromiseMock).toHaveBeenCalled();
        await flushPromises();

        const errorEvent = new AnalyticsErrorEvent({
            component: 'threeDS2Fingerprint',
            code: 'web_704',
            errorType: 'APIError',
            message: 'threeDS2Fingerprint Missing paymentData property from threeDS2 action'
        });

        analytics.sendAnalytics(errorEvent);
        expect(analytics.getEventsQueue().getQueue().errors.length).toBe(1);

        await wait(DEFAULT_DEBOUNCE_TIME_MS);
        expect(analytics.getEventsQueue().getQueue().errors.length).toBe(0);
    });

    test('should send "log" event without delay', async () => {
        const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
        await analytics.setUp();

        expect(collectIdPromiseMock).toHaveBeenCalled();
        await flushPromises();

        const event = new AnalyticsLogEvent({
            component: 'scheme',
            type: 'Submit',
            message: 'shopper clicked pay'
        });

        analytics.sendAnalytics(event);
        expect(analytics.getEventsQueue().getQueue().logs.length).toBe(1);

        await wait(DEFAULT_DEBOUNCE_TIME_MS);
        expect(analytics.getEventsQueue().getQueue().errors.length).toBe(0);
    });

    test('should send "info" event with 10 seconds delay', async () => {
        const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
        await analytics.setUp();

        expect(collectIdPromiseMock).toHaveBeenCalled();
        await flushPromises();

        const event = new AnalyticsInfoEvent({
            component: 'scheme',
            type: ANALYTICS_VALIDATION_ERROR_STR,
            target: 'card_number',
            validationErrorCode: 'cc.num.901',
            validationErrorMessage: 'error-msg-incorrectly-filled-pan'
        });

        jest.useFakeTimers();

        analytics.sendAnalytics(event);
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);

        // 5 seconds pass and the event still there
        jest.advanceTimersByTime(5000);
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(1);

        // 10 seconds pass and the event is sent
        jest.advanceTimersByTime(5000);
        expect(analytics.getEventsQueue().getQueue().info.length).toBe(0);

        jest.clearAllTimers();
        jest.useRealTimers();
    });
});

describe('Analytics - setUp()', () => {
    let collectIdPromiseMock = jest.fn(() => Promise.resolve(MOCKED_ATTEMPT_ID));

    const DEFAULT_ANALYTICS_PROPS: AnalyticsProps = {
        locale: 'en-US',
        clientKey: 'test_client_key',
        analyticsContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
        bundleType: 'umd'
    };
    const storage = new Storage<CheckoutAttemptIdSession>('checkout-attempt-id', 'sessionStorage');

    function setupMocks({ rejectCollectIdPromise }: { rejectCollectIdPromise?: boolean } = {}) {
        collectIdPromiseMock = jest.fn(() => (rejectCollectIdPromise ? Promise.reject() : Promise.resolve(MOCKED_ATTEMPT_ID)));
        mockedCollectId.mockReset();
        mockedCollectId.mockImplementation(() => collectIdPromiseMock);
        collectIdPromiseMock.mockClear();
    }

    beforeEach(() => {
        setupMocks();
        storage.clear();
    });

    test('should make the setup call using level:all by default', async () => {
        const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
        await analytics.setUp();

        expect(mockedCollectId).toHaveBeenCalledWith({
            analyticsContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
            analyticsPath: 'v3/analytics',
            bundleType: 'umd',
            clientKey: 'test_client_key',
            locale: 'en-US'
        });
        expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'all', checkoutStage: 'Checkout' });
    });

    test('should make the setup call using level:info if analytics is disabled', async () => {
        const analytics = Analytics({ ...DEFAULT_ANALYTICS_PROPS, analytics: { enabled: false } });
        await analytics.setUp();

        expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'initial', checkoutStage: 'Checkout' });
    });

    test('should use "PreCheckout" as value for the checkoutStage property if set', async () => {
        const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
        await analytics.setUp({ checkoutStage: 'PreCheckout' });

        expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'all', checkoutStage: 'PreCheckout' });
    });

    test('should save the attempt ID in the session storage', async () => {
        let attemptId: CheckoutAttemptIdSession | null = storage.get();
        expect(attemptId).toBeNull();

        const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
        await analytics.setUp();

        expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'all', checkoutStage: 'Checkout' });
        await flushPromises();

        attemptId = storage.get();
        expect(attemptId.id).toBe(MOCKED_ATTEMPT_ID);
    });

    test('should reuse the attempt ID available in the session storage in the request', async () => {
        storage.set({ id: MOCKED_ATTEMPT_ID, timestamp: Date.now() });

        const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
        await analytics.setUp();

        expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'all', checkoutStage: 'Checkout', checkoutAttemptId: MOCKED_ATTEMPT_ID });
    });

    test('should use attempt ID if it is passed as part of the Analytics configuration (PBL use-case)', async () => {
        const PAYBYLINK_ATTEMPT_ID = 'aaaaa-bbbb-cccc';
        const analytics = Analytics({ ...DEFAULT_ANALYTICS_PROPS, analytics: { analyticsData: { checkoutAttemptId: PAYBYLINK_ATTEMPT_ID } } });
        await analytics.setUp();

        expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'all', checkoutStage: 'Checkout', checkoutAttemptId: PAYBYLINK_ATTEMPT_ID });
    });

    test('should not throw an exception if the attempt ID request fails', async () => {
        setupMocks({ rejectCollectIdPromise: true });

        const warnSpy = jest.spyOn(console, 'warn');

        const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
        await analytics.setUp();

        expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'all', checkoutStage: 'Checkout' });
        await flushPromises();

        expect(warnSpy).toHaveBeenCalled();
    });

    test('should pass "applicationInfo" to the setup if available (Plugins use-case)', async () => {
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

        const analytics = Analytics({
            ...DEFAULT_ANALYTICS_PROPS,
            analytics: {
                analyticsData: {
                    applicationInfo
                }
            }
        });

        await analytics.setUp();

        expect(collectIdPromiseMock).toHaveBeenCalledWith({
            applicationInfo: {
                externalPlatform: {
                    integrator: 'getSystemIntegratorName',
                    name: 'external_platform_name',
                    version: 'external_platform_version'
                },
                merchantApplication: {
                    name: 'merchant_application_name',
                    version: 'version'
                }
            },
            checkoutStage: 'Checkout',
            level: 'all'
        });
    });
});
