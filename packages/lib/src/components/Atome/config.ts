import { COUNTRY, POSTAL_CODE, STREET } from '../internal/Address/constants';

export const ALLOWED_COUNTRIES = ['ID', 'PH', 'TH', 'VN', 'JP', 'TW', 'KR', 'SG', 'MY', 'HK'];

export const BILLING_ADDRESS_SPECIFICATION = {
    default: {
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
