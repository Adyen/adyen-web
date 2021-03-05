import { resolvePlaceholders } from '../../../../utils';
import { PlaceholdersObject, SFInternalConfig } from '../../AbstractSecuredField';
import {
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_SECURITY_CODE_3_DIGITS,
    ENCRYPTED_SECURITY_CODE_4_DIGITS,
    GIFT_CARD
} from '../../../configuration/constants';

/**
 * Create placeholders with a value from the relevant translation file
 */
export function processPlaceholders(configObj: SFInternalConfig, fieldType, i18n) {
    const type = configObj.txVariant;
    const resolvedPlaceholders = resolvePlaceholders(i18n);

    return {
        // Non-SecurityCode fields
        ...(fieldType !== ENCRYPTED_SECURITY_CODE && { [fieldType]: resolvedPlaceholders[fieldType] }),

        // Gift cards
        ...(fieldType === ENCRYPTED_SECURITY_CODE && type === GIFT_CARD && { [fieldType]: resolvedPlaceholders[fieldType] }),

        // Credit card CVC field
        ...(fieldType === ENCRYPTED_SECURITY_CODE &&
            type !== GIFT_CARD && {
                [ENCRYPTED_SECURITY_CODE_3_DIGITS]: resolvedPlaceholders[ENCRYPTED_SECURITY_CODE_3_DIGITS],
                [ENCRYPTED_SECURITY_CODE_4_DIGITS]: resolvedPlaceholders[ENCRYPTED_SECURITY_CODE_4_DIGITS]
            })
    } as PlaceholdersObject;
}
