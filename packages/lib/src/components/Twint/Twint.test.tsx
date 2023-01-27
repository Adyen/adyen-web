import TwintElement from './Twint';

//mock i18n
const i18n = {
    get: key => key,
    // this is useful to check if function is called with right params
    amount: (value, currency) => `${currency} ${value}`
};
const mockDefaultTwintProps = {
    i18n,
    name: 'TWINT',
    amount: {
        currency: 'CHF',
        value: 20000
    }
};

describe('Twint', () => {
    describe('isValid', () => {
        test('Is always valid', () => {
            const twintElement = new TwintElement({});
            expect(twintElement.isValid).toBe(true);
        });
    });

    describe('displayName', () => {
        test('Says saved in title if stored payment method', () => {
            const twintElement = new TwintElement({ ...mockDefaultTwintProps, storedPaymentMethodId: '0123456789' });
            expect(twintElement.displayName).toBe('TWINT twint.saved');
        });

        test('Just say TWINT in title if not stored payment method', () => {
            const twintElement = new TwintElement({ ...mockDefaultTwintProps });
            expect(twintElement.displayName).toBe('TWINT');
        });
    });

    describe('payButtonLabel', () => {
        test('Says Pay + currency + amount', () => {
            const twintElement = new TwintElement({ ...mockDefaultTwintProps, storedPaymentMethodId: '0123456789' });
            expect(twintElement.payButtonLabel()).toBe('payButton CHF 20000');
        });

        test('Says Continue to TWINT', () => {
            const twintElement = new TwintElement({ ...mockDefaultTwintProps });
            expect(twintElement.payButtonLabel()).toBe('continueTo TWINT');
        });
    });
});
