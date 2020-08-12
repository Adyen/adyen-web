import { ADDRESS_SCHEMA } from './constants';
import { AddressSchema } from '../../../types';

export const getInitialData = (data: AddressSchema, requiredFields: string[]): AddressSchema => {
    const addressFilter = (field: string): boolean => !!data[field] || !requiredFields.includes(field);

    const addressReducer = (acc: AddressSchema, cur: string): AddressSchema => {
        acc[cur] = data[cur] || 'N/A';
        return acc;
    };

    return ADDRESS_SCHEMA.filter(addressFilter).reduce(addressReducer, {});
};
