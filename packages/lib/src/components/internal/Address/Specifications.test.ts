import Specifications from './Specifications';
import { ADDRESS_SPECIFICATIONS, PARTIAL_ADDRESS_SCHEMA } from './constants';
import type { AddressSpecifications } from './types';

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
    } satisfies AddressSpecifications;
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

    test('should fall back to the built-in default schema when the provided default has no schema', () => {
        const withoutSchema = new Specifications({ default: {} });
        expect(withoutSchema.getAddressSchemaForCountry('NL')).toBe(ADDRESS_SPECIFICATIONS.default.schema);
    });

    test('should fall back to the built-in default schema when the provided default is not an object', () => {
        // The type does not allow this, but merchants calling from plain JavaScript can still pass it
        const invalidSpecifications: unknown = { default: undefined };
        const withEmptyDefault = new Specifications(invalidSpecifications as AddressSpecifications);
        expect(withEmptyDefault.getAddressSchemaForCountry('NL')).toBe(ADDRESS_SPECIFICATIONS.default.schema);
    });

    test('should return the default schema when no country is provided', () => {
        expect(specifications.getAddressSchemaForCountry(undefined)).toBe(addressSpecificationsMock.default.schema);
    });

    test('getOptionalFieldsForCountry', () => {
        expect(specifications.getOptionalFieldsForCountry('US')).toBe(addressSpecificationsMock.US.optionalFields);
        expect(specifications.getOptionalFieldsForCountry('NL')).toStrictEqual([]);
        expect(specifications.getOptionalFieldsForCountry(undefined)).toStrictEqual([]);
    });

    test('getAddressLabelsForCountry', () => {
        expect(specifications.getAddressLabelsForCountry('US')).toBe(addressSpecificationsMock.US.labels);
        expect(specifications.getAddressLabelsForCountry('NL')).toBeUndefined();
        expect(specifications.getAddressLabelsForCountry(undefined)).toBeUndefined();
    });

    test('should use the labels of the provided default for countries without their own labels', () => {
        const withDefaultLabels = new Specifications({ default: { labels: { postalCode: 'postCode' }, schema: ['country'] } });
        expect(withDefaultLabels.getAddressLabelsForCountry('NL')).toStrictEqual({ postalCode: 'postCode' });
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

    test('should return undefined when no placeholder is defined for the field', () => {
        expect(specifications.getPlaceholderKeyForField('city', 'US')).toBeUndefined();
        expect(specifications.getPlaceholderKeyForField('city', 'NL')).toBeUndefined();
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

    test.each(['GB', 'CA', 'AU', 'BR', 'FR', 'DE', 'NL'])('should use default postalCode label for %s in partial mode', countryCode => {
        expect(partialSpecifications.getKeyForField('postalCode', countryCode)).toBe('postalCode');
    });

    test.each(['US', 'GB', 'FR'])('partial schema for %s should only contain postalCode field', countryCode => {
        expect(partialSpecifications.getAddressSchemaForCountryFlat(countryCode)).toStrictEqual(['postalCode']);
    });
});
