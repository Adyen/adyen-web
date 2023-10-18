import { getActiveFieldsData, getInitialActiveFieldsets } from './utils';
import { OpenInvoiceActiveFieldsets, OpenInvoiceStateData, OpenInvoiceVisibility } from './types';

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
});
