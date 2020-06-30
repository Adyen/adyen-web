import ApplePay from '.';
import defaultProps from './defaultProps';

describe('ApplePay', () => {
    describe('formatProps', () => {
        test('normalizes an amount in a legacy format', () => {
            // @ts-ignore
            const applepay = new ApplePay({ ...defaultProps, currencyCode: 'EUR', amount: 1000 });
            expect(applepay.props.amount.currency).toEqual('EUR');
            expect(applepay.props.amount.value).toEqual(1000);
        });

        test('normalizes an amount in a regular format', () => {
            const applepay = new ApplePay({ ...defaultProps, currencyCode: 'EUR', amount: { currency: 'EUR', value: 2000 } });
            expect(applepay.props.amount.value).toEqual(2000);
            expect(applepay.props.amount.currency).toEqual('EUR');
        });

        test('normalizes an amount with default values', () => {
            const applepay = new ApplePay(defaultProps);
            expect(applepay.props.amount.value).toEqual(0);
            expect(applepay.props.amount.currency).toEqual('USD');
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const applepay = new ApplePay(defaultProps);
            expect(applepay.data).toMatchObject({ paymentMethod: { type: 'applepay' } });
        });
    });
});
