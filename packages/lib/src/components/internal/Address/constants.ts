export const ADDRESS_SCHEMA = ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'];
export const COUNTRIES_WITH_STATES_DATASET = ['BR', 'CA', 'US'];
export const COUNTRIES_WITH_TWO_LINES_ADDRESSES = ['US'];
export const COUNTRIES_WITH_HOUSE_NUMBER_FIRST = ['CA', 'GB'];

export const LABELS = {
    city: {
        GB: 'town',
        default: 'city'
    },
    country: {
        default: 'country'
    },
    houseNumberOrName: {
        US: 'apartmentOrSuite',
        default: 'houseNumberOrName'
    },
    postalCode: {
        US: 'zipCode',
        default: 'postalCode'
    },
    stateOrProvince: {
        CA: 'provinceOrTerritory',
        GB: 'county',
        US: 'state',
        default: 'stateOrProvince'
    },
    street: {
        US: 'address',
        default: 'street'
    }
};
