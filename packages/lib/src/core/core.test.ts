import AdyenCheckout from './core';
import BCMCMobileElement from '../components/BcmcMobile';
import Session from './CheckoutSession';
import { CheckoutSessionSetupResponse } from '../types';

jest.spyOn(Session.prototype, 'setupSession').mockImplementation(() => {
    const sessionSetupResponseMock: CheckoutSessionSetupResponse = {
        id: 'session-id',
        sessionData: 'session-data',
        amount: {
            value: 1000,
            currency: 'USD'
        },
        expiresAt: '',
        paymentMethods: {},
        returnUrl: '',
        configuration: {},
        shopperLocale: 'en-US'
    };

    return Promise.resolve(sessionSetupResponseMock);
});

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.warn = jest.fn(() => {});
});

describe('Core', () => {
    test('should default to the FALLBACK_LOCALE', async () => {
        const checkout = new AdyenCheckout({ environment: 'test', clientKey: 'test_123456' });
        await checkout.initialize();

        expect(checkout.modules.i18n.locale).toBe('en-US');
    });

    test('should create the modules when initializing on Advanced Flow', async () => {
        const checkout = new AdyenCheckout({ environment: 'test', clientKey: 'test_123456' });
        await checkout.initialize();

        expect(Object.keys(checkout.modules).length).toBeGreaterThan(1);
    });

    test('should create the modules when initializing on Sesssions flow', async () => {
        const checkout = new AdyenCheckout({
            environment: 'test',
            clientKey: 'test_123456',
            session: { id: 'session-id', sessionData: 'sesssion-data' }
        });

        await checkout.initialize();

        expect(Object.keys(checkout.modules).length).toBeGreaterThan(1);
    });

    test('should set a custom locale', async () => {
        const checkout = new AdyenCheckout({ environment: 'test', clientKey: 'test_123456', locale: 'es-ES' });
        await checkout.initialize();

        expect(checkout.modules.i18n.locale).toBe('es-ES');
    });

    describe('create', () => {
        test('should create a component if it exists', async () => {
            const checkout = new AdyenCheckout({ environment: 'test', clientKey: 'test_123456' });
            await checkout.initialize();

            expect(checkout.create('dropin')).toBeTruthy();
            expect(() => checkout.create('notapaymentmethod')).toThrow();
        });

        describe('create props order', () => {
            const onSubmitMockGlobal = jest.fn().mockName('onSubmitGlobal');
            const onSubmitMockPMConfig = jest.fn().mockName('onSubmitMockPMConfig');
            const onSubmitMockComponent = jest.fn().mockName('onSubmitMockComponent');

            test('component props receive global props if not defined elsewhere', async () => {
                const checkout = new AdyenCheckout({ environment: 'test', clientKey: 'test_123456', onSubmit: onSubmitMockGlobal });
                await checkout.initialize();
                const component = checkout.create('card');

                expect(component.props.onSubmit).toBe(onSubmitMockGlobal);
            });

            test('component props take precedence over global props', async () => {
                const checkout = new AdyenCheckout({ environment: 'test', clientKey: 'test_123456', onSubmit: onSubmitMockGlobal });
                await checkout.initialize();
                const component = checkout.create('card', { onSubmit: onSubmitMockComponent });

                expect(component.props.onSubmit).toBe(onSubmitMockComponent);
            });

            test('paymentMethodsConfiguration props take precedence over global props', async () => {
                const checkout = new AdyenCheckout({
                    environment: 'test',
                    clientKey: 'test_123456',
                    onSubmit: onSubmitMockGlobal,
                    paymentMethodsConfiguration: { card: { onSubmit: onSubmitMockPMConfig } }
                });
                await checkout.initialize();
                const component = checkout.create('card');

                expect(component.props.onSubmit).toBe(onSubmitMockPMConfig);
            });

            test('component props take precedence over paymentMethodsConfiguration props', async () => {
                const checkout = new AdyenCheckout({
                    environment: 'test',
                    clientKey: 'test_123456',
                    paymentMethodsConfiguration: { card: { onSubmit: onSubmitMockPMConfig } }
                });
                await checkout.initialize();
                const component = checkout.create('card', { onSubmit: onSubmitMockComponent });

                expect(component.props.onSubmit).toBe(onSubmitMockComponent);
            });
        });
    });

    describe('createFromAction', () => {
        test('should create a component from an action object', async () => {
            const checkout = new AdyenCheckout({
                environment: 'test',
                clientKey: 'test_123456'
            });
            await checkout.initialize();

            const paymentAction = checkout.createFromAction({
                method: 'GET',
                paymentMethodType: 'ideal',
                type: 'redirect',
                url: 'https://example.com'
            });

            expect(paymentAction.constructor['type']).toBe('redirect');
        });

        test('should handle new fingerprint action', async () => {
            const checkout = new AdyenCheckout({
                environment: 'test',
                clientKey: 'test_123456',
                paymentMethodsConfiguration: { threeDS2: { challengeWindowSize: '04' } }
            });
            await checkout.initialize();

            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token: 'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OXdhSEF0TnpFdGMybHRiMjR1YzJWaGJXeGxjM010WTJobFkydHZkWFF1WTI5dC50VnJIV3B4UktWVTVPMENiNUg5TVFlUnJKdmZRQ1lnbXR6VTY1WFhzZ2NvIiwidGhyZWVEU01ldGhvZFVybCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL3N0YXJ0TWV0aG9kLnNodG1sIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI5MzI2ZjNiOS00MTc3LTQ4ZTktYmM2Mi1kOTliYzVkZDA2Y2IifQ==',
                type: 'threeDS2'
            };

            const pa = checkout.createFromAction(fingerprintAction);

            expect(pa.constructor['type']).toBe('threeDS2Fingerprint');

            expect(pa.props.elementRef).not.toBeDefined();
            expect(pa.props.showSpinner).toEqual(true);
            expect(pa.props.statusType).toEqual('loading');

            expect(pa.props.challengeWindowSize).toEqual('04');
        });

        test('should handle new challenge action', async () => {
            const checkout = new AdyenCheckout({
                environment: 'test',
                clientKey: 'test_123456',
                paymentMethodsConfiguration: {
                    threeDS2: {
                        challengeWindowSize: '03'
                    }
                }
            });
            await checkout.initialize();

            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                subtype: 'challenge',
                token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                type: 'threeDS2',
                paymentMethodType: 'scheme'
            };

            const pa = checkout.createFromAction(challengeAction);

            expect(pa.constructor['type']).toBe('threeDS2Challenge');
            expect(pa.props.elementRef).not.toBeDefined();
            expect(pa.props.showSpinner).not.toBeDefined();
            expect(pa.props.statusType).toEqual('custom');
            expect(pa.props.challengeWindowSize).toEqual('03');
        });

        describe('create props order', () => {
            const onAdditionalDetailsGlobal = jest.fn().mockName('onSubmitGlobal');
            const onAdditionalDetailsBCMC = jest.fn().mockName('onSubmitMockPMConfig');
            const onAdditionalDetailsCreateFromAction = jest.fn().mockName('onSubmitMockComponent');

            test('paymentMethodsConfiguration properties take precedence over global configuration', async () => {
                const checkout = new AdyenCheckout({
                    environment: 'test',
                    clientKey: 'test_123456',
                    onAdditionalDetails: onAdditionalDetailsGlobal,
                    paymentMethodsConfiguration: { qrCode: { onAdditionalDetails: onAdditionalDetailsBCMC } }
                });
                await checkout.initialize();

                const paymentAction = checkout.createFromAction({
                    paymentMethodType: 'bcmc_mobile_QR',
                    qrCodeData: 'BEP://1bcmc-test.adyen.com/pal/bep$ZTHYT3DHKVXYJ3GHBQNNCX4M',
                    type: 'qrCode',
                    paymentData: 'test'
                });
                expect(paymentAction.props.onAdditionalDetails).toEqual(onAdditionalDetailsBCMC);
            });

            test('createFromAction props take precedence over paymentMethodsConfiguration and global configuration', async () => {
                const checkout = new AdyenCheckout({
                    environment: 'test',
                    clientKey: 'test_123456',
                    onAdditionalDetails: onAdditionalDetailsGlobal,
                    paymentMethodsConfiguration: { qrCode: { onAdditionalDetails: onAdditionalDetailsBCMC } }
                });
                await checkout.initialize();
                const paymentAction = checkout.createFromAction(
                    {
                        paymentMethodType: 'bcmc_mobile_QR',
                        qrCodeData: 'BEP://1bcmc-test.adyen.com/pal/bep$ZTHYT3DHKVXYJ3GHBQNNCX4M',
                        type: 'qrCode',
                        paymentData: 'test'
                    },
                    { onAdditionalDetails: onAdditionalDetailsCreateFromAction }
                );

                expect(paymentAction.props.onAdditionalDetails).toBe(onAdditionalDetailsCreateFromAction);
                paymentAction.onComplete({});
                expect(onAdditionalDetailsCreateFromAction).toHaveBeenCalledWith({}, expect.any(BCMCMobileElement));
            });
        });
    });

    describe('update', () => {
        test('Should update all components under main instance', async () => {
            const checkout = new AdyenCheckout({
                environment: 'test',
                clientKey: 'test_123456'
            });
            await checkout.initialize();

            const component = checkout.create('dropin').mount('body');

            const spy = jest.spyOn(component, 'update');
            await checkout.update();

            expect(spy).toHaveBeenCalled();
        });

        test('should update the payment method list for the advanced flow', async () => {
            const checkout = new AdyenCheckout({
                environment: 'test',
                clientKey: 'xxxx'
            });
            await checkout.initialize();
            const paymentMethodsResponse = { paymentMethods: [{ name: 'Credit Card', type: 'scheme', brands: ['visa'] }] };
            expect(checkout.paymentMethodsResponse).toHaveProperty('paymentMethods', []);
            await checkout.update({ paymentMethodsResponse });
            expect(checkout.paymentMethodsResponse).toHaveProperty('paymentMethods', paymentMethodsResponse.paymentMethods);
        });
    });

    test('should use custom checkoutshopper URL url if available', () => {
        const checkout = new AdyenCheckout({
            environment: 'test',
            environmentUrls: {
                api: 'https://localhost:8080/checkoutshopper/'
            },
            clientKey: 'devl_FX923810'
        });

        expect(checkout.loadingContext).toBe('https://localhost:8080/checkoutshopper/');
    });
});
