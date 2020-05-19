import ApplePay from '.';
import defaultProps from './defaultProps';

describe('ApplePay', () => {
    describe('formatProps', () => {
        test('normalizes an amount in a legacy format', () => {
            const applepay = new ApplePay({ ...defaultProps, currencyCode: 'EUR', amount: 1000 });
            expect(applepay.props.currencyCode).toEqual('EUR');
            expect(applepay.props.amount).toEqual(1000);
        });

        test('normalizes an amount in a regular format', () => {
            const applepay = new ApplePay({ ...defaultProps, currencyCode: 'EUR', amount: { currency: 'USD', value: 2000 } });
            expect(applepay.props.currencyCode).toEqual('USD');
            expect(applepay.props.amount).toEqual(2000);
        });

        test('normalizes an amount with default values', () => {
            const applepay = new ApplePay(defaultProps);
            expect(applepay.props.currencyCode).toEqual('USD');
            expect(applepay.props.amount).toEqual(0);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const applepay = new ApplePay(defaultProps);
            expect(applepay.data).toMatchObject({ paymentMethod: { type: 'applepay' } });
        });
    });
});
