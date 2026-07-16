import { AnalyticsInfoEvent, InfoEventType } from './AnalyticsInfoEvent';

const serialize = (event: AnalyticsInfoEvent) => JSON.parse(JSON.stringify(event));

describe('AnalyticsInfoEvent - payment methods sanitization', () => {
    test('picks only the fixed set of safe fields', () => {
        const paymentMethod = {
            type: 'scheme',
            name: 'Card',
            brands: ['visa', 'mc'],
            brand: 'visa',
            issuers: [{ id: 'issuer-1', name: 'Bank' }],
            configuration: { merchantId: 'test' },
            fundingSource: 'debit',
            group: { name: 'Cards', paymentMethodData: 'data', type: 'scheme' },
            displayMode: 'regular'
        };

        const event = new AnalyticsInfoEvent({
            type: InfoEventType.PaymentListDisplayed,
            component: 'dropin',
            availablePaymentMethods: [paymentMethod]
        });
        const [result] = serialize(event).availablePaymentMethods;

        expect(result.paymentMethodType).toBe('scheme');
        expect(result.brands).toEqual(['visa', 'mc']);
        expect(result.fundingSource).toBe('debit');
        expect(result.displayMode).toBe('regular');
        expect(result).not.toHaveProperty('name');
        expect(result).not.toHaveProperty('issuers');
        expect(result).not.toHaveProperty('configuration');
        expect(result).not.toHaveProperty('group');
        expect(result).not.toHaveProperty('brand');
    });

    test('omits optional fields when absent on the raw object', () => {
        const paymentMethod = { type: 'alipay', name: 'AliPay', displayMode: 'instant' };

        const event = new AnalyticsInfoEvent({
            type: InfoEventType.PaymentListDisplayed,
            component: 'dropin',
            availablePaymentMethods: [paymentMethod]
        });
        const [result] = serialize(event).availablePaymentMethods;

        expect(result).not.toHaveProperty('brands');
        expect(result).not.toHaveProperty('brand');
        expect(result).not.toHaveProperty('fundingSource');
        expect(result).not.toHaveProperty('name');
    });

    test('normalizes a single "brand" string into a "brands" array for payment methods like giftcard', () => {
        const paymentMethod = {
            type: 'giftcard',
            name: 'My Store Loyalty Card',
            brand: 'mystore_loyal',
            displayMode: 'regular'
        };

        const event = new AnalyticsInfoEvent({
            type: InfoEventType.PaymentListDisplayed,
            component: 'dropin',
            availablePaymentMethods: [paymentMethod]
        });
        const [result] = serialize(event).availablePaymentMethods;

        expect(result).toEqual({ paymentMethodType: 'giftcard', brands: ['mystore_loyal'], displayMode: 'regular' });
        expect(result).not.toHaveProperty('brand');
    });

    test('strips PII and internal fields from stored payment methods', () => {
        const paymentMethod = {
            type: 'scheme',
            name: 'Visa',
            id: 'stored-1',
            supportedShopperInteractions: [],
            storedPaymentMethodId: 'stored-1',
            isStoredPaymentMethod: true,
            holderName: 'John Doe',
            shopperEmail: 'john@example.com',
            lastFour: '1234',
            iban: 'NL02ABNA0123456789',
            ownerName: 'John Doe',
            label: 'Visa **** 1234',
            displayMode: 'stored'
        };

        const event = new AnalyticsInfoEvent({
            type: InfoEventType.PaymentListDisplayed,
            component: 'dropin',
            unavailablePaymentMethods: [paymentMethod]
        });
        const [result] = serialize(event).unavailablePaymentMethods;

        expect(result).not.toHaveProperty('holderName');
        expect(result).not.toHaveProperty('shopperEmail');
        expect(result).not.toHaveProperty('lastFour');
        expect(result).not.toHaveProperty('iban');
        expect(result).not.toHaveProperty('ownerName');
        expect(result).not.toHaveProperty('label');
        expect(result).not.toHaveProperty('storedPaymentMethodId');
        expect(result).not.toHaveProperty('isStoredPaymentMethod');
        expect(result).not.toHaveProperty('name');
        expect(result.paymentMethodType).toBe('scheme');
        expect(result.displayMode).toBe('stored');
    });
});
