import Twint from './Twint';

describe('Twint', () => {
    describe('isValid', () => {
        test('Is always valid', () => {
            const twintElement = new Twint({ core: global.core });
            expect(twintElement.isValid).toBe(true);
        });
    });

    describe('displayName', () => {
        test('Says saved in title if stored payment method', () => {
            const twintElement = new Twint({ core: global.core, i18n: global.i18n, isStoredPaymentMethod: true });
            expect(twintElement.displayName).toBe('Twint saved');
        });

        test('Just say TWINT in title if not stored payment method', () => {
            const twintElement = new Twint({ core: global.core, i18n: global.i18n, name: 'TWINT' });
            expect(twintElement.displayName).toBe('TWINT');
        });
    });

    describe('payButtonLabel', () => {
        test('Says Pay + currency + amount', () => {
            const twintElement = new Twint({
                core: global.core,
                i18n: global.i18n,
                isStoredPaymentMethod: true,
                amount: {
                    currency: 'CHF',
                    value: 20000
                }
            });

            expect(twintElement.payButtonLabel()).toEqual('Pay CHF 200.00');
        });

        test('Says Continue to TWINT', () => {
            const twintElement = new Twint({ core: global.core, i18n: global.i18n, name: 'TWINT' });
            expect(twintElement.payButtonLabel()).toBe('Continue to TWINT');
        });
    });
});
