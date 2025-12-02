import Analytics from './Analytics';
import { AnalyticsEventQueue } from './AnalyticsEventQueue';
import { AnalyticsInfoEvent, InfoEventType } from './events/AnalyticsInfoEvent';
import { AnalyticsErrorEvent, ErrorEventType } from './events/AnalyticsErrorEvent';
import { AnalyticsLogEvent, LogEventType } from './events/AnalyticsLogEvent';
import Storage from '../../utils/Storage';
import type { IAnalyticsService } from './AnalyticsService';

jest.mock('../../utils/Storage');

const MockedStorage = Storage as jest.MockedClass<typeof Storage>;

const createMockService = (): jest.Mocked<IAnalyticsService> => ({
    requestCheckoutAttemptId: jest.fn(),
    sendEvents: jest.fn(),
    reportIntegrationFlavor: jest.fn()
});

const MOCK_CHECKOUT_ATTEMPT_ID = 'test-checkout-attempt-id';

describe('Analytics', () => {
    let mockService: jest.Mocked<IAnalyticsService>;
    let eventQueue: AnalyticsEventQueue;
    let mockStorageInstance: { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        mockService = createMockService();
        mockService.requestCheckoutAttemptId.mockResolvedValue(MOCK_CHECKOUT_ATTEMPT_ID);

        eventQueue = new AnalyticsEventQueue();

        mockStorageInstance = {
            get: jest.fn().mockReturnValue(null),
            set: jest.fn(),
            clear: jest.fn()
        };
        MockedStorage.mockImplementation(() => mockStorageInstance as any);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('setUp()', () => {
        it('should request a checkout attempt ID from the service', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });

            await analytics.setUp({ locale: 'en-US' });

            expect(mockService.requestCheckoutAttemptId).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: 'Web',
                    platform: 'Web',
                    locale: 'en-US',
                    checkoutStage: 'checkout',
                    level: 'all'
                })
            );
        });

        it('should use level "initial" when analytics is disabled', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue, enabled: false });

            await analytics.setUp({ locale: 'en-US' });

            expect(mockService.requestCheckoutAttemptId).toHaveBeenCalledWith(
                expect.objectContaining({
                    level: 'initial'
                })
            );
        });

        it('should pass sessionId when provided', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });

            await analytics.setUp({ sessionId: 'test-session-id', locale: 'en-US' });

            expect(mockService.requestCheckoutAttemptId).toHaveBeenCalledWith(
                expect.objectContaining({
                    sessionId: 'test-session-id'
                })
            );
        });

        it('should pass checkoutStage when provided', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });

            await analytics.setUp({ checkoutStage: 'precheckout', locale: 'en-US' });

            expect(mockService.requestCheckoutAttemptId).toHaveBeenCalledWith(
                expect.objectContaining({
                    checkoutStage: 'precheckout'
                })
            );
        });

        it('should store the checkout attempt ID in session storage', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });

            await analytics.setUp({ locale: 'en-US' });

            expect(mockStorageInstance.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: MOCK_CHECKOUT_ATTEMPT_ID
                })
            );
        });

        it('should reuse checkout attempt ID from session storage if not expired', async () => {
            const recentTimestamp = Date.now() - 5 * 60 * 1000; // 5 minutes ago
            mockStorageInstance.get.mockReturnValue({ id: 'stored-attempt-id', timestamp: recentTimestamp });

            const analytics = new Analytics({ service: mockService, eventQueue });

            await analytics.setUp({ locale: 'en-US' });

            expect(mockService.requestCheckoutAttemptId).toHaveBeenCalledWith(
                expect.objectContaining({
                    checkoutAttemptId: 'stored-attempt-id'
                })
            );
        });

        it('should not reuse checkout attempt ID from session storage if expired (>15 minutes)', async () => {
            const expiredTimestamp = Date.now() - 16 * 60 * 1000; // 16 minutes ago
            mockStorageInstance.get.mockReturnValue({ id: 'expired-attempt-id', timestamp: expiredTimestamp });

            const analytics = new Analytics({ service: mockService, eventQueue });

            await analytics.setUp({ locale: 'en-US' });

            expect(mockService.requestCheckoutAttemptId).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    checkoutAttemptId: 'expired-attempt-id'
                })
            );
        });

        it('should use checkoutAttemptId from analyticsData (PayByLink use-case)', async () => {
            const analytics = new Analytics({
                service: mockService,
                eventQueue,
                analyticsData: { checkoutAttemptId: 'pbl-attempt-id' }
            });

            await analytics.setUp({ locale: 'en-US' });

            expect(mockService.requestCheckoutAttemptId).toHaveBeenCalledWith(
                expect.objectContaining({
                    checkoutAttemptId: 'pbl-attempt-id'
                })
            );
        });

        it('should pass applicationInfo from analyticsData (Plugins use-case)', async () => {
            const applicationInfo = {
                merchantApplication: { name: 'test-app', version: '1.0.0' },
                externalPlatform: { name: 'test-platform', version: '2.0.0', integrator: 'test-integrator' }
            };

            const analytics = new Analytics({
                service: mockService,
                eventQueue,
                analyticsData: { applicationInfo }
            });

            await analytics.setUp({ locale: 'en-US' });

            expect(mockService.requestCheckoutAttemptId).toHaveBeenCalledWith(
                expect.objectContaining({
                    applicationInfo
                })
            );
        });

        it('should disable analytics and warn on setup failure', async () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockService.requestCheckoutAttemptId.mockRejectedValue(new Error('Network error'));

            const analytics = new Analytics({ service: mockService, eventQueue });

            await analytics.setUp({ locale: 'en-US' });

            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });

    describe('sendAnalytics()', () => {
        it('should add info events to the queue', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            const infoEvent = new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'card' });
            analytics.sendAnalytics(infoEvent);

            expect(eventQueue.infoEvents).toHaveLength(1);
        });

        it('should add error events to the queue', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            const errorEvent = new AnalyticsErrorEvent({
                component: 'card',
                errorType: ErrorEventType.network,
                code: '500'
            });
            analytics.sendAnalytics(errorEvent);

            expect(eventQueue.errorEvents).toHaveLength(1);
        });

        it('should add log events to the queue', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            const logEvent = new AnalyticsLogEvent({
                type: LogEventType.submit,
                component: 'card',
                message: 'Payment submitted'
            });
            analytics.sendAnalytics(logEvent);

            expect(eventQueue.logEvents).toHaveLength(1);
        });

        it('should not add events to the queue when analytics is disabled', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue, enabled: false });
            await analytics.setUp({ locale: 'en-US' });

            const infoEvent = new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'card' });
            analytics.sendAnalytics(infoEvent);

            expect(eventQueue.infoEvents).toHaveLength(0);
        });

        it('should send info events after debounce delay', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            const infoEvent = new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'card' });
            analytics.sendAnalytics(infoEvent);

            expect(mockService.sendEvents).not.toHaveBeenCalled();

            jest.advanceTimersByTime(10_000);

            expect(mockService.sendEvents).toHaveBeenCalled();
        });

        it('should send error/log events after shorter debounce delay', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            const errorEvent = new AnalyticsErrorEvent({
                component: 'card',
                errorType: ErrorEventType.network,
                code: '500'
            });
            analytics.sendAnalytics(errorEvent);

            expect(mockService.sendEvents).not.toHaveBeenCalled();

            jest.advanceTimersByTime(5_000);

            expect(mockService.sendEvents).toHaveBeenCalled();
        });

        it('should clear the queue after sending events', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            const infoEvent = new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'card' });
            analytics.sendAnalytics(infoEvent);

            jest.advanceTimersByTime(10_000);

            expect(eventQueue.infoEvents).toHaveLength(0);
        });
    });

    describe('sendFlavor()', () => {
        it('should report dropin flavor', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            await analytics.sendFlavor('dropin');

            expect(mockService.reportIntegrationFlavor).toHaveBeenCalledWith('dropin', MOCK_CHECKOUT_ATTEMPT_ID);
        });

        it('should report components flavor', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            await analytics.sendFlavor('components');

            expect(mockService.reportIntegrationFlavor).toHaveBeenCalledWith('components', MOCK_CHECKOUT_ATTEMPT_ID);
        });

        it('should only report flavor once', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            await analytics.sendFlavor('dropin');
            await analytics.sendFlavor('dropin');

            expect(mockService.reportIntegrationFlavor).toHaveBeenCalledTimes(1);
        });

        it('should report flavor when analytics is disabled', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue, enabled: false });
            await analytics.setUp({ locale: 'en-US' });

            await analytics.sendFlavor('dropin');

            expect(mockService.reportIntegrationFlavor).toHaveBeenCalled();
        });

        it('should not report flavor when checkoutAttemptId is not available', async () => {
            mockService.requestCheckoutAttemptId.mockRejectedValue(new Error('Network error'));
            jest.spyOn(console, 'warn').mockImplementation();

            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            await analytics.sendFlavor('dropin');

            expect(mockService.reportIntegrationFlavor).not.toHaveBeenCalled();
        });

        it('should warn on flavor report failure', async () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockService.reportIntegrationFlavor.mockRejectedValue(new Error('Network error'));

            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            await analytics.sendFlavor('dropin');

            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });

    describe('flush()', () => {
        it('should immediately send all queued events', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            const infoEvent = new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'card' });
            analytics.sendAnalytics(infoEvent);

            analytics.flush();

            expect(mockService.sendEvents).toHaveBeenCalled();
            expect(eventQueue.infoEvents).toHaveLength(0);
        });

        it('should not send events when analytics is disabled', async () => {
            const analytics = new Analytics({ service: mockService, eventQueue, enabled: false });
            await analytics.setUp({ locale: 'en-US' });

            analytics.flush();

            expect(mockService.sendEvents).not.toHaveBeenCalled();
        });

        it('should not send events when checkoutAttemptId is not available', async () => {
            mockService.requestCheckoutAttemptId.mockRejectedValue(new Error('Network error'));
            jest.spyOn(console, 'warn').mockImplementation();

            const analytics = new Analytics({ service: mockService, eventQueue });
            await analytics.setUp({ locale: 'en-US' });

            analytics.flush();

            expect(mockService.sendEvents).not.toHaveBeenCalled();
        });
    });
});
