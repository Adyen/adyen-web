import { OpenInvoiceActiveFieldsets, OpenInvoiceStateData, OpenInvoiceVisibility } from './types';
import { fieldsetsSchema } from './OpenInvoice';

const isPrefilled = (fieldsetData: OpenInvoiceStateData = {}): boolean => Object.keys(fieldsetData).length > 1;

export const getActiveFieldsData = (activeFieldsets: OpenInvoiceActiveFieldsets, data: OpenInvoiceStateData): OpenInvoiceStateData =>
    Object.keys(data)
        .filter(fieldset => activeFieldsets[fieldset])
        .reduce((acc, cur) => {
            acc[cur] = data[cur];
            return acc;
        }, {});

export const getInitialActiveFieldsets = (visibility: OpenInvoiceVisibility, data: OpenInvoiceStateData = {}): OpenInvoiceActiveFieldsets =>
    fieldsetsSchema.reduce((acc, fieldset) => {
        const isVisible = visibility[fieldset] !== 'hidden';
        const isDeliveryAddress = fieldset === 'deliveryAddress';
        const billingAddressIsHidden = visibility?.billingAddress === 'hidden';

        // The delivery address will be active not only when set as visible
        // but also when the billing address is hidden or when it has prefilled data
        acc[fieldset] = isVisible && (!isDeliveryAddress || billingAddressIsHidden || isPrefilled(data[fieldset]));
        return acc;
    }, {} as OpenInvoiceActiveFieldsets);
