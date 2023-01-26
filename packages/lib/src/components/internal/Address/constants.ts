import { AddressSpecifications } from './types';

export const FALLBACK_VALUE = 'N/A';
export const ADDRESS_SCHEMA = ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'] as const;
export const [STREET, HOUSE_NUMBER_OR_NAME, POSTAL_CODE, CITY, STATE_OR_PROVINCE, COUNTRY] = ADDRESS_SCHEMA;

// prettier-ignore
export const ADDRESS_SPECIFICATIONS: AddressSpecifications = {
    AU: {
        hasDataset: true,
        labels: {
            [HOUSE_NUMBER_OR_NAME]: 'apartmentSuite',
            [STATE_OR_PROVINCE]: 'state',
            [STREET]: 'address'
        },
        optionalFields: [HOUSE_NUMBER_OR_NAME],
        placeholders: {
            [STATE_OR_PROVINCE]: 'select.state'
        },
        schema: [COUNTRY, STREET, HOUSE_NUMBER_OR_NAME, CITY, [[STATE_OR_PROVINCE, 50], [POSTAL_CODE, 50]]]
    },
    BR: {
        hasDataset: true,
        labels: {
            [STATE_OR_PROVINCE]: 'state'
        },
        placeholders: {
            [STATE_OR_PROVINCE]: 'select.state'
        },
    },
    CA: {
        hasDataset: true,
        labels: {
            [HOUSE_NUMBER_OR_NAME]: 'apartmentSuite',
            [STATE_OR_PROVINCE]: 'provinceOrTerritory',
            [STREET]: 'address'
        },
        optionalFields: [HOUSE_NUMBER_OR_NAME],
        schema: [COUNTRY, STREET, HOUSE_NUMBER_OR_NAME, [[CITY, 70], [POSTAL_CODE, 30]], STATE_OR_PROVINCE]
    },
    GB: {
        labels: {
            [CITY]: 'cityTown'
        },
        schema: [COUNTRY, [[HOUSE_NUMBER_OR_NAME, 30], [STREET, 70]], [[CITY, 70], [POSTAL_CODE, 30]], STATE_OR_PROVINCE]
    },
    US: {
        hasDataset: true,
        labels: {
            [POSTAL_CODE]: 'zipCode',
            [HOUSE_NUMBER_OR_NAME]: 'apartmentSuite',
            [STATE_OR_PROVINCE]: 'state',
            [STREET]: 'address'
        },
        optionalFields: [HOUSE_NUMBER_OR_NAME],
        placeholders: {
            [STATE_OR_PROVINCE]: 'select.state'
        },
        schema: [COUNTRY, STREET, HOUSE_NUMBER_OR_NAME, CITY, [[STATE_OR_PROVINCE, 50], [POSTAL_CODE, 50]]]
    },
    default: {
        optionalFields: [],
        placeholders: {
            [STATE_OR_PROVINCE]: 'select.provinceOrTerritory'
        },
        schema: [COUNTRY, [[STREET, 70], [HOUSE_NUMBER_OR_NAME, 30]], [[POSTAL_CODE, 30], [CITY, 70]], STATE_OR_PROVINCE],
    }
};

export const PARTIAL_ADDRESS_SCHEMA: AddressSpecifications = {
    default: {
        labels: {
            [POSTAL_CODE]: 'zipCode'
        },
        schema: [POSTAL_CODE]
    }
};

export const COUNTRIES_WITH_CUSTOM_SPECIFICATION = Object.keys(ADDRESS_SPECIFICATIONS);
