import { render } from '@testing-library/preact';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ANALYTICS_ERROR_TYPE } from '../../core/Analytics/constants';
import ANCV from './ANCV';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('ANCV', () => {
    describe('createOrder', () => {
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
                errorType: ANALYTICS_ERROR_TYPE.apiError,
                timestamp: expect.any(String),
                id: expect.any(String)
            });
        });
    });
});
