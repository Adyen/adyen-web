import GooglePay from './GooglePay';

describe('GooglePay', () => {
    describe('get data', () => {
        test('always returns a type', () => {
            const gpay = new GooglePay({});
            expect(gpay.data.paymentMethod.type).toBe('paywithgoogle');
        });
    });

    describe('isAvailable', () => {
        test('resolves if is available', () => {
            const gpay = new GooglePay({});
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: true });
            });
            gpay.isAvailable().then(result => {
                expect(result).toBe(true);
            });
        });

        test('rejects if is not available', () => {
            const gpay = new GooglePay({});
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: false });
            });
            gpay.isAvailable().then(result => {
                expect(result).toBe(false);
            });
        });

        test('checks paymentMethodPresent if present', () => {
            const gpay = new GooglePay({});
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
            const gpay = new GooglePay({});
            expect(gpay.props.configuration.merchantId).toEqual('');
        });

        test('Correctly extracts passed merchantId', () => {
            const gpay = new GooglePay({
                paymentMethods: [
                    { type: 'paywithgoogle', name: 'GooglePay', configuration: { merchantId: '12345' } },
                    { type: 'paypal', name: 'PayPal', configuration: { merchantId: '54321' } }
                ]
            });
            expect(gpay.props.configuration.merchantId).toEqual('12345');
        });

        test('Correctly extracts passed merchantId regardless of order', () => {
            const gpay = new GooglePay({
                paymentMethods: [
                    { type: 'paypal', name: 'PayPal', configuration: { merchantId: '54321' } },
                    { type: 'paywithgoogle', name: 'GooglePay', configuration: { merchantId: '12345' } }
                ]
            });
            expect(gpay.props.configuration.merchantId).toEqual('12345');
        });
    });
});
