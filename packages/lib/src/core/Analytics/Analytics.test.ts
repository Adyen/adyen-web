import Analytics from './Analytics';
import collectId from '../Services/analytics/collect-id';
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
const flushPromises = () => new Promise(process.nextTick);
const MOCKED_ATTEMPT_ID = 'xxxx-yyyy-zzzz';

describe('Analytics', () => {
    let collectIdPromiseMock = jest.fn(() => Promise.resolve(MOCKED_ATTEMPT_ID));
    const storage = new Storage<CheckoutAttemptIdSession>('checkout-attempt-id', 'sessionStorage');

    const DEFAULT_ANALYTICS_PROPS: AnalyticsProps = {
        locale: 'en-US',
        clientKey: 'test_client_key',
        analyticsContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/'
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

    describe('constructor()', () => {
        test('should create it with default props', () => {
            const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);

            expect(analytics.getCheckoutAttemptId).not.toBe(null);
            expect(analytics.getEnabled).not.toBe(null);
            expect(analytics.getEnabled()).toBe(true);
            expect(analytics.sendAnalytics).not.toBe(null);
            expect(collectIdPromiseMock).toHaveLength(0);
        });
    });

    describe('sendAnalytics()', () => {
        test('should send "error" event without the delay', async () => {
            const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
            await analytics.setUp();
            await flushPromises();

            expect(collectIdPromiseMock).toHaveBeenCalled();

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
            await flushPromises();

            expect(collectIdPromiseMock).toHaveBeenCalled();

            const event = new AnalyticsLogEvent({
                component: 'scheme',
                type: 'Submit',
                message: 'shopper clicked pay'
            });

            analytics.sendAnalytics(event);
            expect(analytics.getEventsQueue().getQueue().logs.length).toBe(1);

            await wait(DEFAULT_DEBOUNCE_TIME_MS);
            expect(analytics.getEventsQueue().getQueue().logs.length).toBe(0);
        });

        test('should send "info" event with 10 seconds delay', async () => {
            const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
            await analytics.setUp();
            await flushPromises();

            expect(collectIdPromiseMock).toHaveBeenCalled();

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

        test('should not add events to the queue if analytics is disabled', async () => {
            const analytics = Analytics({ ...DEFAULT_ANALYTICS_PROPS, analytics: { enabled: false } });
            await analytics.setUp();
            await flushPromises();

            expect(collectIdPromiseMock).toHaveBeenCalled();

            const event = new AnalyticsLogEvent({
                component: 'scheme',
                type: 'Submit',
                message: 'shopper clicked pay'
            });

            analytics.sendAnalytics(event);
            expect(analytics.getEventsQueue().getQueue().logs.length).toBe(0);
        });
    });

    describe('setUp()', () => {
        test('should make the setup call using level:all by default', async () => {
            const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
            await analytics.setUp();

            expect(mockedCollectId).toHaveBeenCalledWith({
                analyticsContext: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
                analyticsPath: 'v3/analytics',
                clientKey: 'test_client_key',
                locale: 'en-US'
            });
            expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'all', checkoutStage: 'checkout' });
        });

        test('should make the setup call using level:info if analytics is disabled', async () => {
            const analytics = Analytics({ ...DEFAULT_ANALYTICS_PROPS, analytics: { enabled: false } });
            await analytics.setUp();

            expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'initial', checkoutStage: 'checkout' });
        });

        test('should be able to pass checkoutState:precheckout during the setup call', async () => {
            const analytics = Analytics({ ...DEFAULT_ANALYTICS_PROPS, analytics: { enabled: false } });
            await analytics.setUp({ checkoutStage: 'precheckout' });

            expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'initial', checkoutStage: 'precheckout' });
        });

        test('should save the attempt ID in the session storage', async () => {
            let attemptId: CheckoutAttemptIdSession | null = storage.get();
            expect(attemptId).toBeNull();

            const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
            await analytics.setUp();
            await flushPromises();

            expect(collectIdPromiseMock).toHaveBeenCalledWith({ level: 'all', checkoutStage: 'checkout' });

            attemptId = storage.get();
            expect(attemptId.id).toBe(MOCKED_ATTEMPT_ID);
        });

        test('should reuse the attempt ID available in the session storage if it is not expired', async () => {
            storage.set({ id: MOCKED_ATTEMPT_ID, timestamp: Date.now() });

            const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
            await analytics.setUp();

            expect(collectIdPromiseMock).toHaveBeenCalledWith({
                level: 'all',
                checkoutStage: 'checkout',
                checkoutAttemptId: MOCKED_ATTEMPT_ID
            });
        });

        test('should request a new attempt ID if the one available in the session storage is expired', async () => {
            const fifteenMinutesInMs = 15 * 60 * 1000;
            const expiredTimestamp = Date.now() - fifteenMinutesInMs - 1; // 1ms over the limit
            const MOCKED_EXPIRED_ATTEMPT_ID = 'yyyy-xxxx-zzzz';
            storage.set({ id: MOCKED_EXPIRED_ATTEMPT_ID, timestamp: expiredTimestamp });

            const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
            await analytics.setUp();
            await flushPromises();

            expect(collectIdPromiseMock).toHaveBeenCalledWith({
                level: 'all',
                checkoutStage: 'checkout'
            });

            const newSession = storage.get();
            expect(newSession.id).toBe(MOCKED_ATTEMPT_ID);
            expect(newSession.timestamp).toBeGreaterThan(expiredTimestamp);
        });

        test('should use attempt ID if it is passed as part of the Analytics configuration (PBL use-case)', async () => {
            const PAYBYLINK_ATTEMPT_ID = 'aaaaa-bbbb-cccc';
            const analytics = Analytics({
                ...DEFAULT_ANALYTICS_PROPS,
                analytics: { analyticsData: { checkoutAttemptId: PAYBYLINK_ATTEMPT_ID } }
            });
            await analytics.setUp();

            expect(collectIdPromiseMock).toHaveBeenCalledWith({
                level: 'all',
                checkoutStage: 'checkout',
                checkoutAttemptId: PAYBYLINK_ATTEMPT_ID
            });
        });

        test('should not throw an exception if the attempt ID request fails', async () => {
            setupMocks({ rejectCollectIdPromise: true });
            const warnSpy = jest.spyOn(console, 'warn');

            const analytics = Analytics(DEFAULT_ANALYTICS_PROPS);
            await expect(analytics.setUp()).resolves.not.toThrow();
            await flushPromises();

            expect(collectIdPromiseMock).toHaveBeenCalledWith({ checkoutStage: 'checkout', level: 'all' });

            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
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
                level: 'all',
                checkoutStage: 'checkout'
            });
        });
    });
});
