import { Resources } from '../../../core/Context/Resources';
import { camelCaseToSnakeCase } from '../../../utils/textUtils';
import { isArray } from '../../../utils/commonUtils';
import { ALL_SECURED_FIELDS, ENCRYPTED } from './lib/constants';

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
export const fieldTypeToSnakeCase = (fieldType: string) => {
    let str = camelCaseToSnakeCase(fieldType);
    // SFs need their fieldType mapped to what the endpoint expects
    if (ALL_SECURED_FIELDS.includes(fieldType)) {
        str = str.substring(ENCRYPTED.length + 1); // strip 'encrypted_' off the string
    }
    return str;
};
