import { AnalyticsService } from './AnalyticsService';
import { httpPost } from '../Services/http';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';
import { AnalyticsInfoEvent, InfoEventType } from './events/AnalyticsInfoEvent';

jest.mock('../Services/http', () => ({
    httpPost: jest.fn()
}));

const mockHttpPost = httpPost as jest.MockedFunction<typeof httpPost>;

describe('AnalyticsService', () => {
    const clientKey = 'test_client_key';
    const analyticsContext = 'https://analytics.adyen.com/';

    let service: AnalyticsService;

    beforeEach(() => {
        service = new AnalyticsService({ clientKey, analyticsContext });
        jest.clearAllMocks();
    });

    describe('requestCheckoutAttemptId()', () => {
        const payload = {
            version: '5.0.0',
            channel: 'Web' as const,
            platform: 'Web' as const,
            locale: 'en-US',
            checkoutStage: 'checkout' as const,
            referrer: 'https://merchant.com',
            screenWidth: 1920,
            buildType: 'production',
            level: 'initial' as const
        };

        test('should return checkoutAttemptId on successful request', async () => {
            const expectedAttemptId = 'test-checkout-attempt-id';
            mockHttpPost.mockResolvedValueOnce({ checkoutAttemptId: expectedAttemptId });

            const result = await service.requestCheckoutAttemptId(payload);

            expect(result).toBe(expectedAttemptId);
            expect(mockHttpPost).toHaveBeenCalledWith(
                {
                    loadingContext: analyticsContext,
                    path: `v3/analytics?clientKey=${clientKey}`
                },
                payload
            );
        });

        test('should throw AdyenCheckoutError on network failure', async () => {
            mockHttpPost.mockRejectedValueOnce(new Error('Network error'));

            await expect(service.requestCheckoutAttemptId(payload)).rejects.toThrow(AdyenCheckoutError);
            await expect(service.requestCheckoutAttemptId(payload)).rejects.toThrow('requestCheckoutAttemptId() - failed to get checkout attempt ID');
        });
    });

    describe('sendEvents()', () => {
        const checkoutAttemptId = 'test-checkout-attempt-id';

        const createPayload = (hasEvents = true) => ({
            channel: 'Web' as const,
            platform: 'Web' as const,
            info: hasEvents ? [new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'card' })] : [],
            errors: [],
            logs: []
        });

        test('should send events successfully', async () => {
            mockHttpPost.mockResolvedValueOnce({});
            const payload = createPayload();

            await service.sendEvents(payload, checkoutAttemptId);

            expect(mockHttpPost).toHaveBeenCalledWith(
                {
                    loadingContext: analyticsContext,
                    path: `v3/analytics/${checkoutAttemptId}?clientKey=${clientKey}`
                },
                payload
            );
        });

        test('should reject when checkoutAttemptId is missing', async () => {
            const payload = createPayload();

            await expect(service.sendEvents(payload, '')).rejects.toBe('sendEvents() - checkoutAttemptId is required');
            expect(mockHttpPost).not.toHaveBeenCalled();
        });

        test('should resolve when there are no events to send', async () => {
            const payload = createPayload(false);

            await expect(service.sendEvents(payload, checkoutAttemptId)).resolves.toBe(undefined);
            expect(mockHttpPost).not.toHaveBeenCalled();
        });

        test('should throw AdyenCheckoutError on network failure', async () => {
            mockHttpPost.mockRejectedValueOnce(new Error('Network error'));
            const payload = createPayload();

            await expect(service.sendEvents(payload, checkoutAttemptId)).rejects.toThrow(AdyenCheckoutError);
        });
    });

    describe('reportIntegrationFlavor()', () => {
        const checkoutAttemptId = 'test-checkout-attempt-id';

        test('should report dropin flavor successfully', async () => {
            mockHttpPost.mockResolvedValueOnce({});

            await service.reportIntegrationFlavor('dropin', checkoutAttemptId);

            expect(mockHttpPost).toHaveBeenCalledWith(
                {
                    loadingContext: analyticsContext,
                    path: `v3/analytics?clientKey=${clientKey}`
                },
                {
                    flavor: 'dropin',
                    checkoutAttemptId
                }
            );
        });

        test('should report components flavor successfully', async () => {
            mockHttpPost.mockResolvedValueOnce({});

            await service.reportIntegrationFlavor('components', checkoutAttemptId);

            expect(mockHttpPost).toHaveBeenCalledWith(
                {
                    loadingContext: analyticsContext,
                    path: `v3/analytics?clientKey=${clientKey}`
                },
                {
                    flavor: 'components',
                    checkoutAttemptId
                }
            );
        });

        test('should reject when checkoutAttemptId is missing', async () => {
            await expect(service.reportIntegrationFlavor('dropin', '')).rejects.toBe(
                'reportIntegrationFlavor() - flavor or checkoutAttemptId is required'
            );
            expect(mockHttpPost).not.toHaveBeenCalled();
        });

        test('should throw AdyenCheckoutError on network failure', async () => {
            mockHttpPost.mockRejectedValueOnce(new Error('Network error'));

            await expect(service.reportIntegrationFlavor('dropin', checkoutAttemptId)).rejects.toThrow(AdyenCheckoutError);
        });
    });
});
