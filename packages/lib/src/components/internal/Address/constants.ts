import { AddressLabels, AddressSchemas } from './types';

export const ADDRESS_SCHEMA = ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'] as const;
const [STREET, HOUSE_NUMBER, POSTAL_CODE, CITY, STATE, COUNTRY] = ADDRESS_SCHEMA;
export const COUNTRIES_WITH_STATES_DATASET = ['BR', 'CA', 'US'];

// prettier-ignore
export const ADDRESS_SCHEMAS: AddressSchemas = {
    CA: [COUNTRY, HOUSE_NUMBER, STREET, [[CITY, 70], [POSTAL_CODE, 30]], STATE],
    GB: [COUNTRY, [[HOUSE_NUMBER, 30], [STREET, 70]], [[CITY, 70], [POSTAL_CODE, 30]], STATE],
    US: [COUNTRY, STREET, HOUSE_NUMBER, CITY, [[STATE, 50], [POSTAL_CODE, 50]]],
    default: [COUNTRY, [[STREET, 70], [HOUSE_NUMBER, 30]], [[POSTAL_CODE, 30], [CITY, 70]], STATE]
};

export const LABELS: AddressLabels = {
    city: {
        GB: 'cityTown',
        default: CITY
    },
    country: {
        default: COUNTRY
    },
    houseNumberOrName: {
        CA: 'apartmentSuite',
        US: 'apartmentSuite',
        default: HOUSE_NUMBER
    },
    postalCode: {
        US: 'zipCode',
        default: POSTAL_CODE
    },
    stateOrProvince: {
        BR: 'state',
        CA: 'provinceOrTerritory',
        US: 'state',
        default: STATE
    },
    stateOrProvincePlaceholder: {
        BR: 'select.state',
        CA: 'select.provinceOrTerritory',
        US: 'select.state',
        default: 'select.stateOrProvince'
    },
    street: {
        CA: 'address',
        US: 'address',
        default: STREET
    }
};
