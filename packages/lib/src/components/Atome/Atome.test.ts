import Atome from './Atome';

describe('Atome', () => {
    test('should be required for personal details only the firstName, lastName and telephoneNumber', () => {
        const atome = new Atome({ core: global.core });

        expect(atome.props.personalDetailsRequiredFields.length).toBe(3);
        expect(atome.props.personalDetailsRequiredFields.includes('firstName')).toBeTruthy();
        expect(atome.props.personalDetailsRequiredFields.includes('lastName')).toBeTruthy();
        expect(atome.props.personalDetailsRequiredFields.includes('telephoneNumber')).toBeTruthy();
    });

    test('should be required for billing address only the country, street and postal code', () => {
        const atome = new Atome({ core: global.core });

        expect(atome.props.billingAddressRequiredFields.length).toBe(3);
        expect(atome.props.billingAddressRequiredFields.includes('country')).toBeTruthy();
        expect(atome.props.billingAddressRequiredFields.includes('street')).toBeTruthy();
        expect(atome.props.billingAddressRequiredFields.includes('postalCode')).toBeTruthy();
    });

    test('should hide companyDetails and deliveryAddress sections', () => {
        const atome = new Atome({ core: global.core });

        expect(atome.props.visibility.deliveryAddress).toBe('hidden');
        expect(atome.props.visibility.companyDetails).toBe('hidden');
    });
});
