import Core from './core';

describe('Core', () => {
    test('Should default to the FALLBACK_LOCALE', () => {
        const Checkout = new Core({});
        expect(Checkout.modules.i18n.locale).toBe('en-US');
    });

    test('Should contain modules', () => {
        const Checkout = new Core({ locale: 'es-ES' });
        expect(Object.keys(Checkout.modules).length).toBeGreaterThan(1);
    });

    test('Should set a custom locale', () => {
        const Checkout = new Core({ locale: 'es-ES' });
        expect(Checkout.modules.i18n.locale).toBe('es-ES');
    });

    describe('create', () => {
        test('Should create a component if it exists', () => {
            const Checkout = new Core({});
            expect(Checkout.create('dropin')).toBeTruthy();
            expect(() => Checkout.create('notapaymentmethod')).toThrow();
        });
    });

    describe('createFromAction', () => {
        test('Should create a component from an action object', () => {
            const checkout = new Core({});

            const paymentAction = checkout.createFromAction({
                method: 'GET',
                paymentMethodType: 'ideal',
                type: 'redirect',
                url: 'https://example.com'
            });

            expect(paymentAction.constructor['type']).toBe('redirect');
        });
    });
});
