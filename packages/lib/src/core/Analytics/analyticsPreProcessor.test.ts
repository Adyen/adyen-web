import Analytics from './Analytics';
import { PaymentAmount } from '../../types';
import { analyticsPreProcessor } from './analyticsPreProcessor';
import { ANALYTICS_EVENT_INFO, ANALYTICS_RENDERED_STR } from './constants';

let analytics;
let sendAnalytics;

const amount: PaymentAmount = { value: 50000, currency: 'USD' };

describe('Testing AnalyticsPreProcessor: process and output', () => {
    beforeEach(() => {
        analytics = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', amount, bundleType: '' });
        analytics.createAnalyticsEvent = jest.fn(() => {});
        sendAnalytics = analyticsPreProcessor(analytics);
    });

    describe('Testing the data object created for wallets used as expressPMs', () => {
        test('GooglePay with this.props.isExpress = true & this.props.expressPage = "cart" should see these values reflected in the object passed to analytics.createAnalyticsEvent', () => {
            sendAnalytics('paywithgoogle', { type: ANALYTICS_RENDERED_STR }, { isExpress: true, expressPage: 'cart' });

            expect(analytics.createAnalyticsEvent).toBeCalledWith({
                event: ANALYTICS_EVENT_INFO,
                data: {
                    component: 'paywithgoogle',
                    type: 'rendered',
                    isExpress: true,
                    expressPage: 'cart'
                }
            });
        });

        test('GooglePay with this.props.isExpress = null & this.props.expressPage = "cart" should see both these values excluded from the object passed to analytics.createAnalyticsEvent', () => {
            sendAnalytics('paywithgoogle', { type: ANALYTICS_RENDERED_STR }, { isExpress: null, expressPage: 'cart' });

            expect(analytics.createAnalyticsEvent).toBeCalledWith({
                event: ANALYTICS_EVENT_INFO,
                data: {
                    component: 'paywithgoogle',
                    type: 'rendered'
                }
            });
        });

        test('GooglePay with this.props.isExpress = undefined & this.props.expressPage = "cart" should see both these values excluded from the object passed to analytics.createAnalyticsEvent', () => {
            sendAnalytics('paywithgoogle', { type: ANALYTICS_RENDERED_STR }, { isExpress: undefined, expressPage: 'cart' });

            expect(analytics.createAnalyticsEvent).toBeCalledWith({
                event: ANALYTICS_EVENT_INFO,
                data: {
                    component: 'paywithgoogle',
                    type: 'rendered'
                }
            });
        });

        test('GooglePay with this.props.isExpress = "true" (i.e. a string) & this.props.expressPage = "cart" should see both these values excluded from the object passed to analytics.createAnalyticsEvent', () => {
            sendAnalytics('paywithgoogle', { type: ANALYTICS_RENDERED_STR }, { isExpress: 'true', expressPage: 'cart' });

            expect(analytics.createAnalyticsEvent).toBeCalledWith({
                event: ANALYTICS_EVENT_INFO,
                data: {
                    component: 'paywithgoogle',
                    type: 'rendered'
                }
            });
        });

        test('GooglePay with this.props.isExpress = false & this.props.expressPage = "cart" should just see the isExpress reflected in the object passed to analytics.createAnalyticsEvent', () => {
            sendAnalytics('paywithgoogle', { type: ANALYTICS_RENDERED_STR }, { isExpress: false, expressPage: 'cart' });

            expect(analytics.createAnalyticsEvent).toBeCalledWith({
                event: ANALYTICS_EVENT_INFO,
                data: {
                    component: 'paywithgoogle',
                    type: 'rendered',
                    isExpress: false
                }
            });
        });

        test('GooglePay with this.props.isExpress = true & this.props.expressPage = "foobar" (i.e. not a valid value) should just see the isExpress reflected in the object passed to analytics.createAnalyticsEvent', () => {
            sendAnalytics('paywithgoogle', { type: ANALYTICS_RENDERED_STR }, { isExpress: true, expressPage: 'foobar' });

            expect(analytics.createAnalyticsEvent).toBeCalledWith({
                event: ANALYTICS_EVENT_INFO,
                data: {
                    component: 'paywithgoogle',
                    type: 'rendered',
                    isExpress: true
                }
            });
        });
    });
});
