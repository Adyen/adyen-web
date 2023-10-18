import PaymentMethods from './PaymentMethods';
import { PaymentMethodsResponse } from '../../../types';

const paymentMethodsResponseMock: PaymentMethodsResponse = {
    paymentMethods: [
        {
            brands: ['mc', 'visa', 'amex', 'maestro', 'amex_applepay', 'cup', 'diners', 'discover', 'jcb', 'mc_applepay'],
            name: 'Credit Card',
            type: 'scheme'
        },
        { name: 'PayPal', type: 'paypal' }
    ],
    storedPaymentMethods: [
        {
            brand: 'visa',
            expiryMonth: '10',
            expiryYear: '2020',
            holderName: 'Checkout Shopper PlaceHolder',
            id: '8415611088427239',
            lastFour: '1111',
            name: 'VISA',
            supportedShopperInteractions: ['ContAuth'],
            type: 'scheme'
        },
        {
            brand: 'mc',
            expiryMonth: '10',
            expiryYear: '2020',
            holderName: 'John Smith',
            id: '8415644875293191',
            lastFour: '0010',
            name: 'MasterCard',
            supportedShopperInteractions: ['ContAuth', 'Ecommerce'],
            type: 'scheme'
        }
    ]
};

describe('PaymentMethodsResponse', () => {
    test('process payment methods', () => {
        const pmResponse = new PaymentMethods(paymentMethodsResponseMock);
        expect(pmResponse.paymentMethods.length).toBe(2);
        expect(pmResponse.has('scheme')).toBe(true);
    });

    test('filters stored payment methods', () => {
        const pmResponse = new PaymentMethods(paymentMethodsResponseMock);
        expect(pmResponse.storedPaymentMethods.length).toBe(1);
    });
});
