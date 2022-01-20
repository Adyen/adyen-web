import { resolvePlaceholders } from '../../../../utils';
import { SFPlaceholdersObject, SFInternalConfig } from '../../../securedField/AbstractSecuredField';
import {
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_SECURITY_CODE_3_DIGITS,
    ENCRYPTED_SECURITY_CODE_4_DIGITS,
    GIFT_CARD
} from '../../../configuration/constants';

/**
 * Create placeholders with a value from the relevant translation file
 */
export function processPlaceholders(configObj: SFInternalConfig, fieldType, i18n): SFPlaceholdersObject {
    const type: string = configObj.txVariant;
    const resolvedPlaceholders: SFPlaceholdersObject = resolvePlaceholders(i18n);

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
    } as SFPlaceholdersObject;
}
