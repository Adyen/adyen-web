import AdyenCheckout from './core';
import BCMCMobileElement from '../components/BcmcMobile';

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
    console.warn = jest.fn(() => {});
});

describe('Core', () => {
    test('Should default to the FALLBACK_LOCALE', () => {
        const Checkout = new AdyenCheckout({});
        expect(Checkout.modules.i18n.locale).toBe('en-US');
    });

    test('Should contain modules', () => {
        const Checkout = new AdyenCheckout({ locale: 'es-ES' });
        expect(Object.keys(Checkout.modules).length).toBeGreaterThan(1);
    });

    test('Should set a custom locale', () => {
        const Checkout = new AdyenCheckout({ locale: 'es-ES' });
        expect(Checkout.modules.i18n.locale).toBe('es-ES');
    });

    describe('create', () => {
        test('Should create a component if it exists', () => {
            const checkout = new AdyenCheckout({});
            expect(checkout.create('dropin')).toBeTruthy();
            expect(() => checkout.create('notapaymentmethod')).toThrow();
        });

        describe('create props order', () => {
            const onSubmitMockGlobal = jest.fn().mockName('onSubmitGlobal');
            const onSubmitMockPMConfig = jest.fn().mockName('onSubmitMockPMConfig');
            const onSubmitMockComponent = jest.fn().mockName('onSubmitMockComponent');

            test('component props receive global props if not defined elsewhere', () => {
                const checkout = new AdyenCheckout({ onSubmit: onSubmitMockGlobal });
                const component = checkout.create('card');
                expect(component.props.onSubmit).toBe(onSubmitMockGlobal);
            });

            test('component props take precedence over global props', () => {
                const checkout = new AdyenCheckout({ onSubmit: onSubmitMockGlobal });
                const component = checkout.create('card', { onSubmit: onSubmitMockComponent });
                expect(component.props.onSubmit).toBe(onSubmitMockComponent);
            });

            test('paymentMethodsConfiguration props take precedence over global props', () => {
                const checkout = new AdyenCheckout({
                    onSubmit: onSubmitMockGlobal,
                    paymentMethodsConfiguration: { card: { onSubmit: onSubmitMockPMConfig } }
                });
                const component = checkout.create('card');
                expect(component.props.onSubmit).toBe(onSubmitMockPMConfig);
            });

            test('component props take precedence over paymentMethodsConfiguration props', () => {
                const checkout = new AdyenCheckout({
                    paymentMethodsConfiguration: { card: { onSubmit: onSubmitMockPMConfig } }
                });
                const component = checkout.create('card', { onSubmit: onSubmitMockComponent });
                expect(component.props.onSubmit).toBe(onSubmitMockComponent);
            });
        });

        describe('Brands from paymentMethods response reach card component regardless of how the component is created', () => {
            const paymentMethodsResponse = {
                paymentMethods: [
                    {
                        brands: ['visa', 'mc', 'amex', 'maestro', 'bcmc', 'cartebancaire'],
                        name: 'Credit Card',
                        type: 'scheme'
                    },
                    { name: 'Apple Pay', supportsRecurring: true, type: 'applepay' },
                    { name: 'UnionPay', supportsRecurring: true, type: 'unionpay' },
                    { name: 'Moneybookers', supportsRecurring: true, type: 'moneybookers' }
                ]
            };

            const brandsArray = paymentMethodsResponse.paymentMethods[0].brands;

            test('Card component created as "card" receives brands ', () => {
                const checkout = new AdyenCheckout({ paymentMethodsResponse });
                const component = checkout.create('card');
                expect(component.props.brands).toEqual(brandsArray);
            });

            test('Card component created as "scheme" receives brands ', () => {
                const checkout = new AdyenCheckout({ paymentMethodsResponse });
                const component = checkout.create('scheme');
                expect(component.props.brands).toEqual(brandsArray);
            });
        });

        describe('paymentMethodsConfiguration for card reaches card component regardless of how the component is created', () => {
            const paymentMethodsConfiguration = {
                card: {
                    hasHolderName: true
                }
            };

            test('Card component created as "card" receives paymentMethodsConfiguration.card object ', () => {
                const checkout = new AdyenCheckout({ paymentMethodsConfiguration });
                const component = checkout.create('card');
                expect(component.props.hasHolderName).toEqual(true);
            });

            test('Card component created as "scheme" receives paymentMethodsConfiguration.card object ', () => {
                const checkout = new AdyenCheckout({ paymentMethodsConfiguration });
                const component = checkout.create('scheme');
                expect(component.props.hasHolderName).toEqual(true);
            });
        });

        describe('Trying to add a "scheme" property to the paymentMethodsConfiguration throws an error', () => {
            const paymentMethodsConfiguration = {
                scheme: {
                    hasHolderName: true
                }
            };

            test('Trying to create a card component with a paymentMethodsConfiguration with a "scheme" property shows a warning in the console ', () => {
                new AdyenCheckout({ paymentMethodsConfiguration });
                // expect warning in console
                expect(console.warn).toHaveBeenCalled();
            });
        });
    });

    describe('createFromAction', () => {
        test('Should create a component from an action object', () => {
            const checkout = new AdyenCheckout({});

            const paymentAction = checkout.createFromAction({
                method: 'GET',
                paymentMethodType: 'ideal',
                type: 'redirect',
                url: 'https://example.com'
            });

            expect(paymentAction.constructor['type']).toBe('redirect');
        });

        test('should handle new fingerprint action', () => {
            const checkout = new AdyenCheckout({ paymentMethodsConfiguration: { threeDS2: { challengeWindowSize: '04' } } });

            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token:
                    'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OXdhSEF0TnpFdGMybHRiMjR1YzJWaGJXeGxjM010WTJobFkydHZkWFF1WTI5dC50VnJIV3B4UktWVTVPMENiNUg5TVFlUnJKdmZRQ1lnbXR6VTY1WFhzZ2NvIiwidGhyZWVEU01ldGhvZFVybCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL3N0YXJ0TWV0aG9kLnNodG1sIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI5MzI2ZjNiOS00MTc3LTQ4ZTktYmM2Mi1kOTliYzVkZDA2Y2IifQ==',
                type: 'threeDS2'
            };

            const pa = checkout.createFromAction(fingerprintAction);

            expect(pa.constructor['type']).toBe('threeDS2Fingerprint');

            expect(pa.props.elementRef).not.toBeDefined();
            expect(pa.props.showSpinner).toEqual(true);
            expect(pa.props.statusType).toEqual('loading');

            expect(pa.props.challengeWindowSize).toEqual('04');
        });

        test('should handle new challenge action', () => {
            const checkout = new AdyenCheckout({
                paymentMethodsConfiguration: {
                    threeDS2: {
                        challengeWindowSize: '03'
                    }
                }
            });

            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                subtype: 'challenge',
                token:
                    'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
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
            const checkout = new AdyenCheckout({
                onAdditionalDetails: onAdditionalDetailsGlobal,
                paymentMethodsConfiguration: { qrCode: { onAdditionalDetails: onAdditionalDetailsBCMC } }
            });

            test('paymentMethodsConfiguration properties take precedence over global configuration', () => {
                const paymentAction = checkout.createFromAction({
                    paymentMethodType: 'bcmc_mobile_QR',
                    qrCodeData: 'BEP://1bcmc-test.adyen.com/pal/bep$ZTHYT3DHKVXYJ3GHBQNNCX4M',
                    type: 'qrCode',
                    paymentData: 'test'
                });
                expect(paymentAction.props.onAdditionalDetails).toEqual(onAdditionalDetailsBCMC);
            });

            test('createFromAction props take precedence over paymentMethodsConfiguration and global configuration', () => {
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
            const checkout = new AdyenCheckout({});
            const component = checkout.create('dropin').mount('body');
            const spy = jest.spyOn(component, 'update');
            await checkout.update();

            expect(spy).toHaveBeenCalled();
        });
    });
});
