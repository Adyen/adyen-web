import GooglePay from './GooglePay';
import Analytics from '../../core/Analytics';
import { ANALYTICS_EVENT_INFO, ANALYTICS_SELECTED_STR } from '../../core/Analytics/constants';

const analyticsModule = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '' });

describe('GooglePay', () => {
    describe('get data', () => {
        test('always returns a type', () => {
            const gpay = new GooglePay({});
            expect(gpay.data.paymentMethod.type).toBe('paywithgoogle');
        });
    });

    describe('isAvailable', () => {
        test('resolves if is available', () => {
            const gpay = new GooglePay({});
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: true });
            });
            gpay.isAvailable().then(result => {
                expect(result).toBe(true);
            });
        });

        test('rejects if is not available', () => {
            const gpay = new GooglePay({});
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: false });
            });
            gpay.isAvailable().then(result => {
                expect(result).toBe(false);
            });
        });

        test('checks paymentMethodPresent if present', () => {
            const gpay = new GooglePay({});
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: true, paymentMethodPresent: false });
            });
            gpay.isAvailable().then(result => {
                expect(result).toBe(false);
            });
        });
    });

    describe('Process CA based configuration data', () => {
        test('Retrieves default merchantId', () => {
            const gpay = new GooglePay({});
            expect(gpay.props.configuration.merchantId).toEqual('');
        });

        test('Retrieves merchantId from configuration', () => {
            const gpay = new GooglePay({ configuration: { merchantId: 'abcdef', gatewayMerchantId: 'TestMerchant' } });
            expect(gpay.props.configuration.merchantId).toEqual('abcdef');
        });

        test('Retrieves merchantId from configuration', () => {
            const gpay = new GooglePay({
                configuration: {
                    gatewayMerchantId: 'TestMerchant',
                    merchantOrigin: 'example.com'
                }
            });
            expect(gpay.props.configuration.merchantOrigin).toEqual('example.com');
        });

        test('Retrieves authJwt from configuration', () => {
            const gpay = new GooglePay({ configuration: { merchantId: 'abcdef', gatewayMerchantId: 'TestMerchant', authJwt: 'jwt.code' } });
            expect(gpay.props.configuration.authJwt).toEqual('jwt.code');
        });
    });

    describe('GooglePay: calls that generate "info" analytics should produce objects with the expected shapes ', () => {
        let gpay;
        beforeEach(() => {
            console.log = jest.fn(() => {});

            gpay = new GooglePay({
                type: 'googlepay',
                isInstantPayment: true,
                modules: {
                    analytics: analyticsModule
                }
            });

            analyticsModule.createAnalyticsEvent = jest.fn(obj => {
                console.log('### analyticsPreProcessor.test:::: obj=', obj);
            });
        });

        test('Analytics should produce an "info" event, of type "selected", for GooglePay as an instant PM', () => {
            gpay.submit();

            expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
                event: ANALYTICS_EVENT_INFO,
                data: {
                    component: gpay.props.type,
                    type: ANALYTICS_SELECTED_STR,
                    target: 'instant_payment_button'
                }
            });
        });
    });
});
