import GooglePay from './GooglePay';

describe('GooglePay', () => {
    describe('get data', () => {
        test('always returns a type', () => {
            const gpay = new GooglePay({ core: global.core });
            expect(gpay.data.paymentMethod.type).toBe('googlepay');
        });
    });

    describe('isAvailable()', () => {
        test('should resolve if GooglePay is available', async () => {
            const gpay = new GooglePay({ core: global.core });
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: true });
            });

            await expect(gpay.isAvailable()).resolves.not.toThrow();
        });

        test('should reject if is not available', async () => {
            const gpay = new GooglePay({ core: global.core });
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: false });
            });

            await expect(gpay.isAvailable()).rejects.toThrow();
        });

        test('should reject if "paymentMethodPresent" is false', async () => {
            const gpay = new GooglePay({ core: global.core });
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: true, paymentMethodPresent: false });
            });

            await expect(gpay.isAvailable()).rejects.toThrow();
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
