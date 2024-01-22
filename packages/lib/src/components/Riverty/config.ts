import { CITY, COUNTRY, FIRST_NAME, HOUSE_NUMBER_OR_NAME, LAST_NAME, POSTAL_CODE, STATE_OR_PROVINCE, STREET } from '../internal/Address/constants';
import { AddressSpecifications } from '../internal/Address/types';

export const allowedCountries = ['AT', 'CH', 'DE'];
export const personalDetailsRequiredFields = ['firstName', 'lastName', 'dateOfBirth', 'shopperEmail', 'telephoneNumber'];
export const deliveryAddressSpecification: AddressSpecifications = {
    default: {
        labels: {
            [FIRST_NAME]: 'deliveryAddress.firstName',
            [LAST_NAME]: 'deliveryAddress.lastName'
        },
        schema: [
            COUNTRY,
            [
                [FIRST_NAME, 50],
                [LAST_NAME, 50]
            ],
            [
                [STREET, 70],
                [HOUSE_NUMBER_OR_NAME, 30]
            ],

            [
                [POSTAL_CODE, 30],
                [CITY, 70]
            ],
            STATE_OR_PROVINCE
        ]
    }
};
export const termsAndConditionsUrlMap = {
    at: {
        en: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/at_en',
        de: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/at_de'
    },
    ch: {
        en: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/ch_en',
        de: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/ch_de',
        fr: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/ch_fr'
    },
    de: {
        en: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/de_en',
        de: 'https://documents.riverty.com/terms_conditions/payment_methods/invoice/de_de'
    }
};
