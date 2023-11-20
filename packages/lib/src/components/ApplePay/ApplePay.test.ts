import ApplePay from '.';
import defaultProps from './defaultProps';
import { formatBillingAddress } from './utils';

(global as any).ApplePaySession = {
    supportsVersion: jest.fn(() => true)
};

describe('ApplePay', () => {
    describe('formatProps', () => {
        test('accepts an amount in a regular format', () => {
            const applepay = new ApplePay({ ...defaultProps, currencyCode: 'EUR', amount: { currency: 'EUR', value: 2000 } });
            expect(applepay.props.amount.value).toEqual(2000);
            expect(applepay.props.amount.currency).toEqual('EUR');
        });

        test('accepts an amount with default values', () => {
            const applepay = new ApplePay(defaultProps);
            expect(applepay.props.amount.value).toEqual(0);
            expect(applepay.props.amount.currency).toEqual('USD');
        });

        test('uses merchantName if no totalPriceLabel was defined', () => {
            const applepay = new ApplePay({ ...defaultProps, configuration: { merchantName: 'Test' } });
            expect(applepay.props.totalPriceLabel).toEqual('Test');
        });

        test('can set totalPriceLabel', () => {
            const applepay = new ApplePay({ ...defaultProps, configuration: { merchantName: 'Test' }, totalPriceLabel: 'Total' });
            expect(applepay.props.totalPriceLabel).toEqual('Total');
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const applepay = new ApplePay(defaultProps);
            expect(applepay.data).toMatchObject({ paymentMethod: { type: 'applepay' } });
        });
    });

    describe('format billing contact as billing address', () => {
        test('Moves house number from address line 1 into house number and unit to end of street', () => {
            const billingContact = {
                addressLines: ['1 Infinite Loop', 'Unit 100'],
                locality: 'Cupertino',
                administrativeArea: 'CA',
                postalCode: '95014',
                countryCode: 'US',
                country: 'United States',
                givenName: 'John',
                familyName: 'Appleseed',
                phoneticFamilyName: '',
                phoneticGivenName: '',
                subAdministrativeArea: '',
                subLocality: ''
            };

            const billingAddress = formatBillingAddress(billingContact);

            expect(billingAddress.houseNumberOrName).toEqual('1');
            expect(billingAddress.street).toEqual('Infinite Loop Unit 100');
            expect(billingAddress.city).toEqual('Cupertino');
            expect(billingAddress.postalCode).toEqual('95014');
            expect(billingAddress.country).toEqual('US');
            expect(billingAddress.stateOrProvince).toEqual('CA');
        });
        test('When only postal code provided, returns billing address with only postal code', () => {
            const billingContact = {
                addressLines: [],
                locality: '',
                administrativeArea: '',
                postalCode: '95014',
                countryCode: '',
                country: '',
                givenName: '',
                familyName: '',
                phoneticFamilyName: '',
                phoneticGivenName: '',
                subAdministrativeArea: '',
                subLocality: ''
            };

            const billingAddress = formatBillingAddress(billingContact);

            expect(billingAddress.houseNumberOrName).toEqual('');
            expect(billingAddress.street).toEqual('');
            expect(billingAddress.city).toEqual('');
            expect(billingAddress.postalCode).toEqual('95014');
            expect(billingAddress.country).toEqual('');
            expect(billingAddress.stateOrProvince).toEqual('');
        });
    });
});
