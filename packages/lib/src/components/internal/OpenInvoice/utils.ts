import { OpenInvoiceActiveFieldsets, OpenInvoiceStateData, OpenInvoiceVisibility } from './types';
import Language from '../../../language';
import { mapFieldKey as mapFieldKeyPD } from '../PersonalDetails/utils';
import { mapFieldKey as mapFieldKeyAddress } from '../Address/utils';
import { StringObject } from '../Address/types';

export const fieldsetsSchema: Array<keyof OpenInvoiceStateData> = [
    'companyDetails',
    'personalDetails',
    'billingAddress',
    'deliveryAddress',
    'bankAccount'
];

const isPrefilled = (fieldsetData: object = {}): boolean => Object.keys(fieldsetData).length > 1;

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

/**
 * Used by the SRPanel sorting function to tell it whether we need to prepend the field type to the SR panel message, and, if so, we retrieve the correct translation for the field type.
 * (Whether we need to prepend the field type depends on whether we know that the error message correctly reflects the label of the field. Ultimately all error messages should do this
 * and this mapping fn will become redundant)
 */
export const mapFieldKey = (key: string, i18n: Language, countrySpecificLabels: StringObject): string => {
    let refKey = key;
    let label;

    // Differentiate between address types (billing and delivery)
    const splitKey = refKey.split(':');
    const hasSplitKey = splitKey.length > 1;
    if (hasSplitKey) {
        label = splitKey[0];
        refKey = splitKey[1];
    }

    const addressKey = mapFieldKeyAddress(refKey, i18n, countrySpecificLabels);
    // Also use the presence of a label to know that we are dealing with address related fields. (This matters now that addresses can contain first & last name fields.)
    if (addressKey && label) return hasSplitKey ? `${i18n.get(label)} ${addressKey}` : addressKey;

    // Personal details related
    switch (refKey) {
        case 'gender':
        case 'dateOfBirth':
            return mapFieldKeyPD(refKey, i18n);
        default:
            break;
    }

    // We know that the translated error messages do contain a reference to the field they refer to, so we won't need to map them
    return null;
};
