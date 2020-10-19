import { ADDRESS_SCHEMA, LABELS } from './constants';
import { AddressSchema } from '../../../types';

export const getFieldLabelKey = (fieldName, country) => LABELS[fieldName][country] || LABELS[fieldName].default;

/**
 * Generates an object to be used as the initial data.
 * @param data - The data to pre-fill the address fields
 * @param requiredFields - The list of fields to be included in the address form
 */
export const getInitialData = (data: AddressSchema, requiredFields: string[]): AddressSchema => {
    /**
     * We only want to include the fields if they have pre-filled data or if the field is not required.
     */
    const addressFilter = (field: string): boolean => !!data[field] || !requiredFields.includes(field);

    /**
     * Creates the data object filling it with either its pre-filled data or `N/A`.
     */
    const addressReducer = (acc: AddressSchema, cur: string): AddressSchema => {
        acc[cur] = data[cur] || 'N/A';
        return acc;
    };

    return ADDRESS_SCHEMA.filter(addressFilter).reduce(addressReducer, {});
};
