import GooglePay from './GooglePay';

describe('GooglePay', () => {
    describe('get data', () => {
        test('always returns a type', () => {
            const gpay = new GooglePay({ core: global.core });
            expect(gpay.data.paymentMethod.type).toBe('googlepay');
        });
    });

    describe('isAvailable', () => {
        test('resolves if is available', () => {
            const gpay = new GooglePay({ core: global.core });
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: true });
            });
            gpay.isAvailable().then(result => {
                expect(result).toBe(true);
            });
        });

        test('rejects if is not available', () => {
            const gpay = new GooglePay({ core: global.core });
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: false });
            });
            gpay.isAvailable().then(result => {
                expect(result).toBe(false);
            });
        });

        test('checks paymentMethodPresent if present', () => {
            const gpay = new GooglePay({ core: global.core });
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
            const gpay = new GooglePay({ core: global.core });
            expect(gpay.props.configuration.merchantId).toEqual('');
        });

        test('Retrieves merchantId from configuration', () => {
            const gpay = new GooglePay({ core: global.core, configuration: { merchantId: 'abcdef', gatewayMerchantId: 'TestMerchant' } });
            expect(gpay.props.configuration.merchantId).toEqual('abcdef');
        });

        test('Retrieves merchantId from configuration', () => {
            const gpay = new GooglePay({
                core: global.core,
                configuration: {
                    gatewayMerchantId: 'TestMerchant',
                    merchantOrigin: 'example.com'
                }
            });
            expect(gpay.props.configuration.merchantOrigin).toEqual('example.com');
        });

        test('Retrieves authJwt from configuration', () => {
            const gpay = new GooglePay({
                core: global.core,
                configuration: { merchantId: 'abcdef', gatewayMerchantId: 'TestMerchant', authJwt: 'jwt.code' }
            });
            expect(gpay.props.configuration.authJwt).toEqual('jwt.code');
        });
    });
});
