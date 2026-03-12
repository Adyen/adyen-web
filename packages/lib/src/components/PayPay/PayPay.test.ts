import PayPayElement from './PayPay';

jest.mock('./services/PayPaySdkLoader', () => {
    return jest.fn().mockImplementation(() => ({
        load: jest.fn().mockResolvedValue(undefined),
        isSdkLoaded: jest.fn().mockResolvedValue(undefined)
    }));
});

describe('PayPay', () => {
    describe('isValid', () => {
        test('Is always valid', () => {
            const paypayElement = new PayPayElement(global.core);
            expect(paypayElement.isValid).toBe(true);
        });
    });

    describe('formatData', () => {
        test('should return paymentMethod with type paypay', () => {
            const paypayElement = new PayPayElement(global.core);
            expect(paypayElement.formatData()).toEqual({
                paymentMethod: {
                    type: 'paypay'
                }
            });
        });
    });
});
