import { formatApplePayContactToAdyenAddressFormat } from './utils';

describe('formatApplePayContactToAdyenAddressFormat()', () => {
    test('should build the street by merging the address lines and set houseNumberOrName to ZZ', () => {
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

        const billingAddress = formatApplePayContactToAdyenAddressFormat(billingContact);

        expect(billingAddress.houseNumberOrName).toEqual('ZZ');
        expect(billingAddress.street).toEqual('1 Infinite Loop Unit 100');
        expect(billingAddress.city).toEqual('Cupertino');
        expect(billingAddress.postalCode).toEqual('95014');
        expect(billingAddress.country).toEqual('US');
        expect(billingAddress.stateOrProvince).toEqual('CA');
    });
    test('should return only postal code if available', () => {
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

        const billingAddress = formatApplePayContactToAdyenAddressFormat(billingContact);

        expect(billingAddress.houseNumberOrName).toEqual('');
        expect(billingAddress.street).toEqual('');
        expect(billingAddress.city).toEqual('');
        expect(billingAddress.postalCode).toEqual('95014');
        expect(billingAddress.country).toEqual('');
        expect(billingAddress.stateOrProvince).toEqual('');
    });

    test.todo('should return firstName and lastName if the contact is for delivery address');

    test.todo('should omit stateOrProvince field if not available');
});
