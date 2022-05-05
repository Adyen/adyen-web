import { COUNTRIES_WITH_CUSTOM_SPECIFICATION, COUNTRY, POSTAL_CODE, STREET } from '../internal/Address/constants';
import { AddressSpecifications } from '../internal/Address/types';

const ATOME_ADDRESS_SPECIFICATION = {
    labels: {
        [STREET]: 'address'
    },
    schema: [
        STREET,
        [
            [COUNTRY, 70],
            [POSTAL_CODE, 30]
        ]
    ]
};

export const ATOME_SUPPORTED_COUNTRIES = ['ID', 'PH', 'TH', 'VN', 'JP', 'TW', 'KR', 'SG', 'MY', 'HK'];

/**
 * Creates Address Specification according to the Atome UI. This specification overrides all available specifications
 *
 * This custom specification is needed in order to create the desired layout of the Atome billing address part. The usage of the
 * 'default' layout specification from the Address component does not align correctly the available fields, therefore we need to
 * create this customization.
 */
export const BILLING_ADDRESS_SPECIFICATION = COUNTRIES_WITH_CUSTOM_SPECIFICATION.reduce(
    (memo: AddressSpecifications, countryCode: string) => {
        return {
            ...memo,
            [countryCode]: ATOME_ADDRESS_SPECIFICATION
        };
    },
    { default: ATOME_ADDRESS_SPECIFICATION }
);
