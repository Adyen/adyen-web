import { render } from '@testing-library/preact';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import ANCV from './ANCV';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { ErrorEventType } from '../../core/Analytics/events/AnalyticsErrorEvent';

describe('ANCV', () => {
    describe('createOrder', () => {
        test('should call the onOrderRequest callback prop when provided', async () => {
            const core = setupCoreMock();
            const i18n = global.i18n;

            const onOrderRequest = jest.fn((resolve, _reject, _data) => {
                resolve({ orderData: 'mockOrderData', pspReference: 'mockPspRef' });
            });

            const ancv = new ANCV(core, {
                amount: { value: 1000, currency: 'EUR' },
                i18n,
                loadingContext: 'mock',
                // @ts-ignore test only
                onOrderRequest
            });
            render(ancv.render());

            await ancv.createOrder();

            expect(onOrderRequest).toHaveBeenCalledTimes(1);
            expect(onOrderRequest).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), expect.any(Object));
        });

        test('should send an error event to the analytics if the createOrder call fails for the session flow', async () => {
            const core = setupCoreMock();
            const i18n = global.i18n;

            const code = 'mockErrorCode';

            const ancv = new ANCV(core, {
                amount: { value: 1000, currency: 'EUR' },
                i18n,
                loadingContext: 'mock',

                onError: () => {},
                // @ts-ignore test only
                session: {
                    createOrder: () => {
                        return Promise.reject(new AdyenCheckoutError('NETWORK_ERROR', '', { code }));
                    }
                }
            });
            render(ancv.render());

            await ancv.createOrder();

            expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledWith({
                code,
                component: 'ancv',
                errorType: ErrorEventType.apiError,
                timestamp: expect.any(String),
                id: expect.any(String)
            });
        });
    });
});
