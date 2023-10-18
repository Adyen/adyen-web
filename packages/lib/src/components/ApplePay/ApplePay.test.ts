import ApplePay from './ApplePay';

describe('ApplePay', () => {
    describe('formatProps', () => {
        test('accepts an amount in a regular format', () => {
            const applepay = new ApplePay({
                core: global.core,
                countryCode: 'US',
                amount: { currency: 'EUR', value: 2000 }
            });
            expect(applepay.props.amount.value).toEqual(2000);
            expect(applepay.props.amount.currency).toEqual('EUR');
        });

        test('accepts an amount with default values', () => {
            const applepay = new ApplePay({ core: global.core, countryCode: 'US' });
            expect(applepay.props.amount.value).toEqual(0);
            expect(applepay.props.amount.currency).toEqual('USD');
        });

        test('uses merchantName if no totalPriceLabel was defined', () => {
            const applepay = new ApplePay({ core: global.core, countryCode: 'US', configuration: { merchantName: 'Test' } });
            expect(applepay.props.totalPriceLabel).toEqual('Test');
        });

        test('can set totalPriceLabel', () => {
            const applepay = new ApplePay({
                core: global.core,
                countryCode: 'US',
                configuration: { merchantName: 'Test' },
                totalPriceLabel: 'Total'
            });
            expect(applepay.props.totalPriceLabel).toEqual('Total');
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const applepay = new ApplePay({ core: global.core, countryCode: 'US' });
            expect(applepay.data).toMatchObject({ paymentMethod: { type: 'applepay' } });
        });
    });
});
