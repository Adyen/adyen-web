import { formatApplePayContactToAdyenAddressFormat, mapBrands, resolveSupportedVersion } from './utils';

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

        expect(billingAddress).toStrictEqual({
            postalCode: '95014',
            houseNumberOrName: 'ZZ',
            street: '1 Infinite Loop Unit 100',
            city: 'Cupertino',
            country: 'US',
            stateOrProvince: 'CA'
        });
    });

    test('should return only postal code if available', () => {
        const billingContact: ApplePayJS.ApplePayPaymentContact = {
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

        expect(billingAddress).toStrictEqual({
            postalCode: '95014',
            houseNumberOrName: 'ZZ',
            street: '',
            city: '',
            country: ''
        });
    });

    test('should return firstName and lastName if the contact is for delivery address', () => {
        const deliveryContact: ApplePayJS.ApplePayPaymentContact = {
            addressLines: ['802 Richardon Drive', 'Brooklyn'],
            locality: 'New York',
            administrativeArea: 'NY',
            postalCode: '11213',
            countryCode: 'US',
            country: 'United States',
            givenName: 'Jonny',
            familyName: 'Smithson',
            phoneticFamilyName: '',
            phoneticGivenName: '',
            subAdministrativeArea: '',
            subLocality: ''
        };

        const deliveryAddress = formatApplePayContactToAdyenAddressFormat(deliveryContact, true);

        expect(deliveryAddress).toStrictEqual({
            street: '802 Richardon Drive Brooklyn',
            houseNumberOrName: 'ZZ',
            city: 'New York',
            postalCode: '11213',
            country: 'US',
            stateOrProvince: 'NY',
            firstName: 'Jonny',
            lastName: 'Smithson'
        });
    });

    test('should return undefined if no contact details is passed', () => {
        // @ts-ignore Testing passing no parameter
        expect(formatApplePayContactToAdyenAddressFormat()).toBeUndefined();
    });
});

describe('mapBrands()', () => {
    test('should rename certain brands based on the Apple Pay SDK brands support', () => {
        const backofficeBrands = ['mc', 'elodebit', 'eftpos_australia', 'cartebancaire'];
        const applePayBrands = mapBrands(backofficeBrands);
        expect(applePayBrands).toStrictEqual(['masterCard', 'elo', 'eftpos', 'cartesBancaires']);
    });

    test('should not add unsupported brand to the Apple Pay brands array', () => {
        const backofficeBrands = ['visa', 'amex', 'new_brand'];
        const applePayBrands = mapBrands(backofficeBrands);
        expect(applePayBrands).toStrictEqual(['visa', 'amex']);
    });
});

describe('resolveSupportedVersion', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'ApplePaySession', {
            value: {
                supportsVersion: null
            }
        });
    });

    test('should return supported version if ApplePaySession is available', () => {
        // @ts-ignore bbbb
        window.ApplePaySession.supportsVersion = jest.fn().mockImplementation((version: number) => {
            return version === 10;
        });

        const version = resolveSupportedVersion(14);
        expect(version).toBe(10);
    });

    test('should return null if ApplePaySession is not available', () => {
        // @ts-ignore bbb
        window.ApplePaySession.supportsVersion = null;

        const version = resolveSupportedVersion(14);
        expect(version).toBeNull();
    });
});
