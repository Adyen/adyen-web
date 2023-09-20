import PaymentMethods from './PaymentMethods';

const paymentMethodsResponseMock = {
    paymentMethods: [
        {
            brands: ['mc', 'visa', 'amex', 'maestro', 'amex_applepay', 'cup', 'diners', 'discover', 'jcb', 'mc_applepay'],
            details: [
                { key: 'number', type: 'text' },
                { key: 'expiryMonth', type: 'text' },
                { key: 'expiryYear', type: 'text' },
                { key: 'cvc', type: 'text' },
                { key: 'holderName', optional: true, type: 'text' }
            ],
            name: 'Credit Card',
            type: 'scheme'
        },
        { name: 'PayPal', supportsRecurring: true, type: 'paypal' }
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
