import Specifications from './Specifications';

describe('Specifications', () => {
    const addressSpecificationsMock = {
        US: {
            hasDataset: true,
            labels: {
                postalCode: 'zipCode'
            },
            optionalFields: ['houseNumberOrName'],
            schema: ['country', 'postalCode']
        },
        default: {
            schema: ['country', 'city', 'postalCode']
        }
    };
    const specifications = new Specifications(addressSpecificationsMock);

    test('countryHasDataset', () => {
        expect(specifications.countryHasDataset('US')).toBe(true);
        expect(specifications.countryHasDataset('NL')).toBe(false);
    });

    test('countryHasOptionalField', () => {
        expect(specifications.countryHasOptionalField('US', 'houseNumberOrName')).toBe(true);
        expect(specifications.countryHasOptionalField('US', 'postalCode')).toBe(false);
        expect(specifications.countryHasOptionalField('NL', 'postalCode')).toBe(false);
    });

    test('getAddressSchemaForCountry', () => {
        expect(specifications.getAddressSchemaForCountry('US')).toBe(addressSpecificationsMock.US.schema);
        expect(specifications.getAddressSchemaForCountry('NL')).toBe(addressSpecificationsMock.default.schema);
    });

    test('getKeyForField', () => {
        expect(specifications.getKeyForField('postalCode', 'US')).toBe(addressSpecificationsMock.US.labels.postalCode);
        expect(specifications.getKeyForField('country', 'US')).toBe('country');
        expect(specifications.getKeyForField('country', 'NL')).toBe('country');
    });
});
