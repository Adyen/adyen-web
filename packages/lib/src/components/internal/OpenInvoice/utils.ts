import { ActiveFieldsets, OpenInvoiceStateData, OpenInvoiceVisibility } from './types';

const isPrefilled = (fieldsetData: OpenInvoiceStateData = {}): boolean => Object.keys(fieldsetData).length > 1;

const getActiveFieldsData = (data: OpenInvoiceStateData, activeFieldsets: ActiveFieldsets): OpenInvoiceStateData =>
    Object.keys(data)
        .filter(fieldset => activeFieldsets[fieldset])
        .reduce((acc, cur) => {
            acc[cur] = data[cur];
            return acc;
        }, {});

const getInitialActiveFieldsets = (fieldsets, visibility: OpenInvoiceVisibility, data: OpenInvoiceStateData): ActiveFieldsets =>
    fieldsets.reduce((acc, fieldset) => {
        const isVisible = visibility[fieldset] !== 'hidden';
        acc[fieldset] = isVisible && (fieldset !== 'deliveryAddress' || isPrefilled(data[fieldset]));
        return acc;
    }, {});

export { getActiveFieldsData, getInitialActiveFieldsets };
