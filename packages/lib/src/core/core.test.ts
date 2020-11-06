import AdyenCheckout from './core';
import BCMCMobileElement from '../components/BcmcMobile';

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

        describe('create props order', () => {
            const onAdditionalDetailsGlobal = jest.fn().mockName('onSubmitGlobal');
            const onAdditionalDetailsBCMC = jest.fn().mockName('onSubmitMockPMConfig');
            const onAdditionalDetailsCreateFromAction = jest.fn().mockName('onSubmitMockComponent');
            const checkout = new AdyenCheckout({
                onAdditionalDetails: onAdditionalDetailsGlobal,
                paymentMethodsConfiguration: { bcmc_mobile_QR: { onAdditionalDetails: onAdditionalDetailsBCMC } }
            });

            test('paymentMethodsConfiguration properties take precedence over global configuration', () => {
                const paymentAction = checkout.createFromAction({
                    paymentMethodType: 'bcmc_mobile_QR',
                    qrCodeData: 'BEP://1bcmc-test.adyen.com/pal/bep$ZTHYT3DHKVXYJ3GHBQNNCX4M',
                    type: 'qrCode',
                    paymentData: 'test'
                });
                expect(paymentAction.props.onAdditionalDetails).toBe(onAdditionalDetailsBCMC);
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
        test('Should update all components under main instance', () => {
            const checkout = new AdyenCheckout({});
            const component = checkout.create('dropin').mount('body');
            const spy = jest.spyOn(component, 'update');
            checkout.update();

            expect(spy).toHaveBeenCalled();
        });
    });
});
