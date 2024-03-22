import { getActiveFieldsData, getInitialActiveFieldsets, mapFieldKey } from './utils';
import { OpenInvoiceActiveFieldsets, OpenInvoiceStateData, OpenInvoiceVisibility } from './types';
import Language from '../../../language';

describe('OpenInvoice utils', () => {
    describe('getActiveFieldsData', () => {
        test('should return only the state of the active fieldsets', () => {
            const activeFieldsets: OpenInvoiceActiveFieldsets = {
                companyDetails: false,
                personalDetails: true,
                billingAddress: false,
                deliveryAddress: false,
                bankAccount: false
            };

            const data: OpenInvoiceStateData = {
                personalDetails: { firstName: 'shopper' },
                billingAddress: { country: 'NL' },
                deliveryAddress: { country: 'NL' }
            };

            expect(getActiveFieldsData(activeFieldsets, data).personalDetails).toBeDefined();
            expect(getActiveFieldsData(activeFieldsets, data).billingAddress).not.toBeDefined();
        });
    });

    describe('getInitialActiveFieldsets', () => {
        test('should return false for hidden fieldsets', () => {
            const visibility: OpenInvoiceVisibility = {
                personalDetails: 'editable',
                billingAddress: 'readOnly',
                deliveryAddress: 'hidden'
            };

            expect(getInitialActiveFieldsets(visibility).personalDetails).toBe(true);
            expect(getInitialActiveFieldsets(visibility).billingAddress).toBe(true);
            expect(getInitialActiveFieldsets(visibility).deliveryAddress).toBe(false);
        });

        test('should return true for delivery address when it is not set to hidden and it is prefilled', () => {
            const data: OpenInvoiceStateData = {
                deliveryAddress: {
                    street: 'Test',
                    country: 'NL'
                }
            };

            const visibility: OpenInvoiceVisibility = {
                deliveryAddress: 'editable'
            };

            expect(getInitialActiveFieldsets(visibility, data).deliveryAddress).toBe(true);
        });

        test('should return true for delivery address when it is not set to hidden and the billing address is hidden', () => {
            const visibility: OpenInvoiceVisibility = {
                billingAddress: 'hidden',
                deliveryAddress: 'editable'
            };

            expect(getInitialActiveFieldsets(visibility).deliveryAddress).toBe(true);
        });
    });
    describe('mapFieldKey functionality', () => {
        const i18n = new Language('en-US');

        const BILLING_ADDRESS = i18n.get('billingAddress');
        const DELIVERY_ADDRESS = i18n.get('deliveryAddress');
        const STREET = i18n.get('street');
        const DATE_OF_BIRTH = i18n.get('dateOfBirth');
        const RECIPIENT_FIRST_NAME = i18n.get('deliveryAddress.firstName');
        const ZIP_CODE = i18n.get('zipCode');

        const labelSpecs = {
            firstName: 'deliveryAddress.firstName',
            lastName: 'deliveryAddress.lastName',
            postalCode: 'zipCode'
        };

        test('Should return expected strings from mapping function', () => {
            // should split key and return translated string in expected format
            expect(mapFieldKey('billingAddress:street', i18n, null)).toEqual(`${BILLING_ADDRESS} ${STREET}`);

            // should split and use labels spec to return translated string in expected format
            expect(mapFieldKey('deliveryAddress:firstName', i18n, labelSpecs)).toEqual(`${DELIVERY_ADDRESS} ${RECIPIENT_FIRST_NAME}`);

            // key doesn't need splitting and shouldn't be mapped
            expect(mapFieldKey('street', i18n, null)).toEqual(null);

            // Not an address related field, but should be mapped
            expect(mapFieldKey('dateOfBirth', i18n, null)).toEqual(DATE_OF_BIRTH);

            // Not an address related field, should not be mapped
            expect(mapFieldKey('firstName', i18n, null)).toEqual(null);

            // should split and use labels spec to return translated string in expected format with country specific variation
            expect(mapFieldKey('billingAddress:postalCode', i18n, labelSpecs)).toEqual(`${BILLING_ADDRESS} ${ZIP_CODE}`);
        });
    });
});
