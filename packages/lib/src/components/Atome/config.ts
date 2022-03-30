import { COUNTRY, POSTAL_CODE, STREET } from '../internal/Address/constants';
import { AddressSpecifications } from '../internal/Address/types';

export const ALLOWED_COUNTRIES = ['ID', 'PH', 'TH', 'VN', 'JP', 'TW', 'KR', 'SG', 'MY', 'HK'];

/**
 * Creates Address Specification for each country that Atome supports.
 *
 * This custom specification is needed in order to create the desired layout of the Atome billing address part. The usage of the
 * 'default' layout specification from the Address component does not align correctly the available fields, therefore we need to
 * create this customization.
 */
export const BILLING_ADDRESS_SPECIFICATION = ALLOWED_COUNTRIES.reduce((memo: AddressSpecifications, countryCode: string) => {
    return {
        ...memo,
        [countryCode]: {
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
        }
    };
}, {});
