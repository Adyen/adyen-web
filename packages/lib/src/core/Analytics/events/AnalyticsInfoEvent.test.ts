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

        const event = new AnalyticsInfoEvent({ type: InfoEventType.Ready, component: 'dropin', paymentMethods: [paymentMethod] });
        const [result] = serialize(event).paymentMethods;

        expect(result.type).toBe('scheme');
        expect(result.brands).toEqual(['visa', 'mc']);
        expect(result.brand).toBe('visa');
        expect(result.fundingSource).toBe('debit');
        expect(result.displayMode).toBe('regular');
        expect(result).not.toHaveProperty('name');
        expect(result).not.toHaveProperty('issuers');
        expect(result).not.toHaveProperty('configuration');
        expect(result).not.toHaveProperty('group');
    });

    test('omits optional fields when absent on the raw object', () => {
        const paymentMethod = { type: 'alipay', name: 'AliPay', displayMode: 'instant' };

        const event = new AnalyticsInfoEvent({ type: InfoEventType.Ready, component: 'dropin', paymentMethods: [paymentMethod] });
        const [result] = serialize(event).paymentMethods;

        expect(result).not.toHaveProperty('brands');
        expect(result).not.toHaveProperty('brand');
        expect(result).not.toHaveProperty('fundingSource');
        expect(result).not.toHaveProperty('name');
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

        const event = new AnalyticsInfoEvent({ type: InfoEventType.Ready, component: 'dropin', unavailablePaymentMethods: [paymentMethod] });
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
        expect(result.type).toBe('scheme');
        expect(result.displayMode).toBe('stored');
    });
});
