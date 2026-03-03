import { Resources } from '../../../core/Context/Resources';
import { camelCaseToSnakeCase } from '../../../utils/textUtils';
import { ALL_SECURED_FIELDS, ENCRYPTED } from './lib/constants';
import type { SFField } from './lib/types';

/**
 * Used by SecuredFieldsProviderHandlers
 */
export const getCardImageUrl = (brand, resources: Resources) => {
    const type = brand === 'card' ? 'nocard' : brand || 'nocard';

    const imageOptions = {
        type,
        extension: 'svg'
    };

    return resources.getImage(imageOptions)(type);
};

/**
 * Used by Card.tsx & SecuredFields.tsx
 * @param fieldType -
 */
export const fieldTypeToSnakeCase = (fieldType: string): string => {
    let str = camelCaseToSnakeCase(fieldType);
    // SFs need their fieldType mapped to what the endpoint expects
    if (isSecuredField(fieldType)) {
        str = str.substring(ENCRYPTED.length + 1); // strip 'encrypted_' off the string
    }
    return str;
};

/**
 * Type guard function to check if a string is a valid SFField.
 * This is used to narrow down the type of a string to a valid SF field type.
 * If the string is a valid SF field, the function returns `true` and the type of the string becomes `SFField`.
 * If the string is not a valid SF field, the function returns `false` and the type of the string remains `string`.
 * @param value - the string to check if it is a valid SF field
 * @returns `true` if the string is a valid SF field, `false` otherwise
 */
export function isSecuredField(value: string): value is SFField {
    return (ALL_SECURED_FIELDS as readonly string[]).includes(value);
}
