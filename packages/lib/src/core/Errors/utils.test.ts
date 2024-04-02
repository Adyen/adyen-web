import { mapFieldKey as mapFieldKeyOI } from '../../components/internal/OpenInvoice/utils';
import { mapFieldKey as mapFieldKeyCC } from '../../components/Card/components/CardInput/utils';
import Language from '../../language';
import { SortErrorsObj } from './types';
import { sortErrorsByLayout } from './utils';
import enUS from '../../../../server/translations/en-US.json';

describe('Tests for Errors/utils', () => {
    const i18n = new Language({ locale: 'en-US', translations: enUS });

    describe('Test sortErrorsByLayout function for ValidationRuleResult type errors, with a US localization for some fields', () => {
        // ValidationRuleResult type errors, jumbled
        const ERRORS = {
            firstName: {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'firstName.invalid'
            },
            gender: {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'gender.notselected'
            },
            lastName: {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'lastName.invalid'
            },
            'billingAddress:city': {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'field.error.required'
            },
            shopperEmail: {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'field.error.required'
            },
            telephoneNumber: {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'field.error.required'
            },
            'billingAddress:street': {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'field.error.required'
            },
            dateOfBirth: {
                shouldValidate: true,
                isValid: false,
                errorMessage: 'field.error.required'
            },
            'billingAddress:stateOrProvince': {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'field.error.required'
            },
            'billingAddress:postalCode': {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'field.error.required'
            }
        };

        const COUNTRY_SPECIFIC_LABELS = {
            postalCode: 'zipCode',
            houseNumberOrName: 'apartmentSuite',
            stateOrProvince: 'state',
            street: 'address'
        };

        const REQUIRED_FIELD = i18n.get('field.error.required').replace('%{label}', '');
        const BILLING_ADDRESS = i18n.get('billingAddress');

        // Expected result
        const SORTED_ERRORS = [
            {
                field: 'firstName',
                errorMessage: i18n.get('firstName.invalid'),
                errorCode: 'firstName.invalid'
            },
            {
                field: 'lastName',
                errorMessage: i18n.get('lastName.invalid'),
                errorCode: 'lastName.invalid'
            },
            {
                field: 'gender',
                errorMessage: i18n.get('gender.notselected'),
                errorCode: 'gender.notselected'
            },
            {
                field: 'dateOfBirth',
                errorMessage: `${REQUIRED_FIELD}${i18n.get('dateOfBirth')}`,
                errorCode: 'field.error.required'
            },
            {
                field: 'shopperEmail',
                errorMessage: `${REQUIRED_FIELD}${i18n.get('shopperEmail')}`,
                errorCode: 'field.error.required'
            },
            {
                field: 'telephoneNumber',
                errorMessage: `${REQUIRED_FIELD}${i18n.get('telephoneNumber')}`,
                errorCode: 'field.error.required'
            },
            {
                field: 'billingAddress:street',
                errorMessage: `${REQUIRED_FIELD}${BILLING_ADDRESS} ${i18n.get('address')}`,
                errorCode: 'field.error.required'
            },
            {
                field: 'billingAddress:city',
                errorMessage: `${REQUIRED_FIELD}${BILLING_ADDRESS} ${i18n.get('city')}`,
                errorCode: 'field.error.required'
            },
            {
                field: 'billingAddress:stateOrProvince',
                errorMessage: `${REQUIRED_FIELD}${BILLING_ADDRESS} ${i18n.get('state')}`,
                errorCode: 'field.error.required'
            },
            {
                field: 'billingAddress:postalCode',
                errorMessage: `${REQUIRED_FIELD}${BILLING_ADDRESS} ${i18n.get('zipCode')}`,
                errorCode: 'field.error.required'
            }
        ];

        const LAYOUT = [
            'firstName',
            'lastName',
            'gender',
            'dateOfBirth',
            'shopperEmail',
            'telephoneNumber',
            'billingAddress:country',
            'billingAddress:street',
            'billingAddress:houseNumberOrName',
            'billingAddress:city',
            'billingAddress:stateOrProvince',
            'billingAddress:postalCode'
        ];

        test('should sort ValidationRuleResult errors into objects with the expected properties, in the expected order', () => {
            const sortErrObj: SortErrorsObj = {
                // @ts-ignore it's a test
                errors: ERRORS,
                i18n,
                layout: LAYOUT,
                countrySpecificLabels: COUNTRY_SPECIFIC_LABELS,
                fieldTypeMappingFn: mapFieldKeyOI
            };

            expect(sortErrorsByLayout(sortErrObj)).toEqual(SORTED_ERRORS);
        });
    });

    describe('Test sortErrorsByLayout function for Credit card type errors', () => {
        // Credit card type errors, jumbled
        const ERRORS = {
            socialSecurityNumber: null,
            encryptedExpiryDate: {
                isValid: false,
                errorMessage: 'error-msg-empty-date',
                errorI18n: i18n.get('cc.dat.910'),
                error: 'cc.dat.910',
                rootNode: {}
            },
            taxNumber: null,
            encryptedSecurityCode: {
                isValid: false,
                errorMessage: 'error-msg-empty-cvc',
                errorI18n: i18n.get('cc.cvc.920'),
                error: 'cc.cvc.920',
                rootNode: {}
            },
            encryptedCardNumber: {
                isValid: false,
                errorMessage: 'error-msg-empty-pan',
                errorI18n: i18n.get('cc.num.900'),
                error: 'cc.num.900',
                rootNode: {}
            },
            holderName: {
                shouldValidate: true,
                isValid: null,
                errorMessage: 'creditCard.holderName.invalid'
            }
        };

        // Expected result
        const SORTED_ERRORS = [
            {
                field: 'encryptedCardNumber',
                errorMessage: i18n.get('cc.num.900'),
                errorCode: 'cc.num.900'
            },
            {
                field: 'encryptedExpiryDate',
                errorMessage: i18n.get('cc.dat.910'),
                errorCode: 'cc.dat.910'
            },
            {
                field: 'encryptedSecurityCode',
                errorMessage: i18n.get('cc.cvc.920'),
                errorCode: 'cc.cvc.920'
            },
            {
                field: 'holderName',
                errorMessage: i18n.get('creditCard.holderName.invalid'),
                errorCode: 'creditCard.holderName.invalid'
            }
        ];

        const LAYOUT = ['encryptedCardNumber', 'encryptedExpiryDate', 'encryptedSecurityCode', 'holderName'];

        test('should sort Credit card type errors into objects with the expected properties, in the expected order', () => {
            const sortErrObj: SortErrorsObj = {
                // @ts-ignore it's a test
                errors: ERRORS,
                i18n,
                layout: LAYOUT,
                fieldTypeMappingFn: mapFieldKeyCC
            };

            expect(sortErrorsByLayout(sortErrObj)).toEqual(SORTED_ERRORS);
        });
    });
});
