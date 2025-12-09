import Specifications from './Specifications';
import { PARTIAL_ADDRESS_SCHEMA } from './constants';

describe('Specifications', () => {
    const addressSpecificationsMock = {
        US: {
            hasDataset: true,
            labels: {
                postalCode: 'zipCode'
            },
            placeholders: {
                postalCode: '90210'
            },
            optionalFields: ['houseNumberOrName'],
            schema: ['country', 'postalCode']
        },
        CA: {
            schema: [
                'country',
                [
                    ['postalCode', 50],
                    ['city', 50]
                ]
            ]
        },
        default: {
            placeholders: {
                stateOrProvince: 'select.stateOrProvince'
            },
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

    test('getPlaceholderKeyForField', () => {
        expect(specifications.getPlaceholderKeyForField('postalCode', 'US')).toBe(addressSpecificationsMock.US.placeholders.postalCode);
        expect(specifications.getPlaceholderKeyForField('stateOrProvince', 'US')).toBe(
            addressSpecificationsMock.default.placeholders.stateOrProvince
        );
    });

    test('getFlatSchemaForCountry', () => {
        expect(specifications.getAddressSchemaForCountryFlat('CA')).toStrictEqual(['country', 'postalCode', 'city']);
        expect(specifications.getAddressSchemaForCountryFlat('PT')).toStrictEqual(['country', 'city', 'postalCode']);
    });
});

describe('Partial Address Schema Specifications', () => {
    const partialSpecifications = new Specifications(PARTIAL_ADDRESS_SCHEMA);

    test('should use zipCode label for US postal code in partial mode', () => {
        expect(partialSpecifications.getKeyForField('postalCode', 'US')).toBe('zipCode');
    });

    test('should use default postalCode label for GB in partial mode', () => {
        expect(partialSpecifications.getKeyForField('postalCode', 'GB')).toBe('postalCode');
    });

    test('should use default postalCode label for CA in partial mode', () => {
        expect(partialSpecifications.getKeyForField('postalCode', 'CA')).toBe('postalCode');
    });

    test('should use default postalCode label for AU in partial mode', () => {
        expect(partialSpecifications.getKeyForField('postalCode', 'AU')).toBe('postalCode');
    });

    test('should use default postalCode label for BR in partial mode', () => {
        expect(partialSpecifications.getKeyForField('postalCode', 'BR')).toBe('postalCode');
    });

    test('should use default postalCode label for unspecified countries in partial mode', () => {
        expect(partialSpecifications.getKeyForField('postalCode', 'FR')).toBe('postalCode');
        expect(partialSpecifications.getKeyForField('postalCode', 'DE')).toBe('postalCode');
        expect(partialSpecifications.getKeyForField('postalCode', 'NL')).toBe('postalCode');
    });

    test('partial schema should only contain postalCode field', () => {
        expect(partialSpecifications.getAddressSchemaForCountryFlat('US')).toStrictEqual(['postalCode']);
        expect(partialSpecifications.getAddressSchemaForCountryFlat('GB')).toStrictEqual(['postalCode']);
        expect(partialSpecifications.getAddressSchemaForCountryFlat('FR')).toStrictEqual(['postalCode']);
    });
});
