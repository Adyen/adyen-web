import { formatGooglePayContactToAdyenAddressFormat } from './utils';

describe('formatGooglePayContactToAdyenAddressFormat()', () => {
    test('should build the street by merging the addresses and set houseNumberOrName to ZZ', () => {
        const billingContact: google.payments.api.Address = {
            phoneNumber: '+1 650-555-5555',
            address1: '1600 Amphitheatre Parkway',
            address2: 'Brooklyn',
            address3: '',
            sortingCode: '',
            countryCode: 'US',
            postalCode: '94043',
            name: 'Card Holder Name',
            locality: 'Mountain View',
            administrativeArea: 'CA'
        };

        const billingAddress = formatGooglePayContactToAdyenAddressFormat(billingContact);

        expect(billingAddress).toStrictEqual({
            postalCode: '94043',
            houseNumberOrName: 'ZZ',
            street: '1600 Amphitheatre Parkway Brooklyn',
            city: 'Mountain View',
            country: 'US',
            stateOrProvince: 'CA'
        });
    });

    test('should return postal code and available fields', () => {
        const billingContact: Partial<google.payments.api.Address> = {
            countryCode: 'US',
            postalCode: '94043',
            name: 'Card Holder Name'
        };

        const billingAddress = formatGooglePayContactToAdyenAddressFormat(billingContact);

        expect(billingAddress).toStrictEqual({
            postalCode: '94043',
            houseNumberOrName: 'ZZ',
            country: 'US',
            street: '',
            city: ''
        });
    });

    test('should return firstName and lastName if the contact is for delivery address', () => {
        const deliveryContact: Partial<google.payments.api.Address> = {
            phoneNumber: '+61 2 9374 4000',
            address1: '48 Pirrama Road',
            address2: '',
            address3: '',
            sortingCode: '',
            countryCode: 'AU',
            postalCode: '2009',
            name: 'Australian User',
            locality: 'Sydney',
            administrativeArea: 'NSW'
        };

        const deliveryAddress = formatGooglePayContactToAdyenAddressFormat(deliveryContact, true);

        expect(deliveryAddress).toStrictEqual({
            postalCode: '2009',
            country: 'AU',
            street: '48 Pirrama Road',
            houseNumberOrName: 'ZZ',
            city: 'Sydney',
            stateOrProvince: 'NSW',
            firstName: 'Australian User'
        });
    });
});
