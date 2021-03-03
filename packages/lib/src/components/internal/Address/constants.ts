import { AddressSpecifications } from './types';

export const ADDRESS_SCHEMA = ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'] as const;
const [STREET, HOUSE_NUMBER, POSTAL_CODE, CITY, STATE, COUNTRY] = ADDRESS_SCHEMA;

// prettier-ignore
export const ADDRESS_SPECIFICATIONS: AddressSpecifications = {
    BR: {
        hasDataset: true,
        labels: {
            stateOrProvince: 'state',
            stateOrProvincePlaceholder: 'select.state'
        }
    },
    CA: {
        hasDataset: true,
        labels: {
            houseNumberOrName: 'apartmentSuite',
            stateOrProvince: 'provinceOrTerritory',
            stateOrProvincePlaceholder: 'select.provinceOrTerritory',
            street: 'address'
        },
        optionalFields: [HOUSE_NUMBER],
        schema: [COUNTRY, STREET, HOUSE_NUMBER, [[CITY, 70], [POSTAL_CODE, 30]], STATE]
    },
    GB: {
        labels: {
            city: 'cityTown'
        },
        schema: [COUNTRY, [[HOUSE_NUMBER, 30], [STREET, 70]], [[CITY, 70], [POSTAL_CODE, 30]], STATE]
    },
    US: {
        hasDataset: true,
        labels: {
            postalCode: 'zipCode',
            houseNumberOrName: 'apartmentSuite',
            stateOrProvince: 'state',
            stateOrProvincePlaceholder: 'select.state',
            street: 'address'
        },
        optionalFields: [HOUSE_NUMBER],
        schema: [COUNTRY, STREET, HOUSE_NUMBER, CITY, [[STATE, 50], [POSTAL_CODE, 50]]]
    },
    default: {
        schema: [COUNTRY, [[STREET, 70], [HOUSE_NUMBER, 30]], [[POSTAL_CODE, 30], [CITY, 70]], STATE]
    }
};
