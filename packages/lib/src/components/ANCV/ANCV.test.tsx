import { render } from '@testing-library/preact';
import { mockDeep } from 'jest-mock-extended';
import { AnalyticsModule } from '../../types/global-types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ANALYTICS_ERROR_TYPE, ANALYTICS_EVENT } from '../../core/Analytics/constants';
import ANCV from './ANCV';

const flushPromises = () => new Promise(process.nextTick);

describe('ANCV', () => {
    const resources = global.resources;
    const i18n = global.i18n;

    const baseProps = {
        amount: { value: 1000, currency: 'EUR' },
        i18n,
        loadingContext: 'mock'
    };

    describe('createOrder', () => {
        test('should send an error event to the analytics if the createOrder call fails for the session flow', async () => {
            const code = 'mockErrorCode';
            const analytics = mockDeep<AnalyticsModule>();
            const mockedSendAnalytics = analytics.sendAnalytics as jest.Mock;

            const ancv = new ANCV(global.core, {
                ...baseProps,
                modules: {
                    resources,
                    analytics
                },
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
            await flushPromises();
            expect(mockedSendAnalytics).toHaveBeenCalledWith(
                'ancv',
                { code, errorType: ANALYTICS_ERROR_TYPE.apiError, type: ANALYTICS_EVENT.error },
                undefined
            );
        });
    });
});
