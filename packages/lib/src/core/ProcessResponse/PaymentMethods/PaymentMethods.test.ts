import PaymentMethods from './PaymentMethods';
import { PaymentMethodsResponse } from '../../../types/global-types';

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

    describe('findByFundingSource()', () => {
        const splitFundingResponse: PaymentMethodsResponse = {
            paymentMethods: [
                { name: 'Credit Card', type: 'scheme', fundingSource: 'credit' },
                { name: 'Debit Card', type: 'scheme', fundingSource: 'debit' },
                { name: 'PayPal', type: 'paypal' }
            ]
        };

        test('should return the payment method matching both type and fundingSource', () => {
            const pmResponse = new PaymentMethods(splitFundingResponse);
            // eslint-disable-next-line testing-library/await-async-queries
            const result = pmResponse.findByFundingSource('card', 'credit');
            expect(result.name).toBe('Credit Card');
            expect(result.fundingSource).toBe('credit');
        });

        test('should return the debit payment method when fundingSource is debit', () => {
            const pmResponse = new PaymentMethods(splitFundingResponse);
            // eslint-disable-next-line testing-library/await-async-queries
            const result = pmResponse.findByFundingSource('card', 'debit');
            expect(result.name).toBe('Debit Card');
            expect(result.fundingSource).toBe('debit');
        });

        test('should fall back to the first matching type when fundingSource has no match', () => {
            const pmResponse = new PaymentMethods(splitFundingResponse);
            // eslint-disable-next-line testing-library/await-async-queries
            const result = pmResponse.findByFundingSource('card', 'prepaid');
            expect(result.name).toBe('Credit Card');
        });

        test('should work with non-card payment methods', () => {
            const pmResponse = new PaymentMethods(splitFundingResponse);
            // eslint-disable-next-line testing-library/await-async-queries
            const result = pmResponse.findByFundingSource('paypal', 'credit');
            expect(result.name).toBe('PayPal');
        });
    });
});
