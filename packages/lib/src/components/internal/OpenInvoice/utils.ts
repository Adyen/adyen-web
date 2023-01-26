import { OpenInvoiceActiveFieldsets, OpenInvoiceStateData, OpenInvoiceVisibility } from './types';
import Language from '../../../language';
import { mapFieldKey as mapFieldKeyPD } from '../PersonalDetails/utils';
import { mapFieldKey as mapFieldKeyAddress } from '../Address/utils';

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

export const mapFieldKey = (key: string, i18n: Language): string => {
    // console.log('### utils::mapFieldKey:: key', key);

    const addressKey = mapFieldKeyAddress(key, i18n);
    if (addressKey) return addressKey;

    switch (key) {
        case 'gender':
        case 'dateOfBirth':
            return mapFieldKeyPD(key, i18n);

        default:
            break;
    }

    return null;
};
