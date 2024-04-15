import { ENCRYPTED_SECURITY_CODE, ENCRYPTED_SECURITY_CODE_3_DIGITS, ENCRYPTED_SECURITY_CODE_4_DIGITS, GIFT_CARD, SF_FIELDS_MAP } from '../constants';
import { AriaConfigObject } from '../types';
import type Language from '../../../../../language';

/**
 * Based on txVariant & fieldType, add a field specific contextualTexts object to the passed object
 */
export default (originalObj: AriaConfigObject, i18n: Language, txVariant: string, fieldType: string): AriaConfigObject => {
    const nuObj: AriaConfigObject = { ...originalObj };

    const contextualTexts = {};

    switch (txVariant) {
        case 'ach':
            // TODO - when we know the required texts
            break;
        case GIFT_CARD:
            // TODO - when we know the required texts
            break;
        default:
            // Use field type to only add the texts specific to the creditCard securedField
            switch (fieldType) {
                case ENCRYPTED_SECURITY_CODE:
                    contextualTexts[ENCRYPTED_SECURITY_CODE_3_DIGITS] = i18n.get('creditCard.securityCode.contextualText.3digits');
                    contextualTexts[ENCRYPTED_SECURITY_CODE_4_DIGITS] = i18n.get('creditCard.securityCode.contextualText.4digits');
                    break;

                default: {
                    const translationKey = `creditCard.${SF_FIELDS_MAP[fieldType]}.contextualText`;
                    const translation = i18n.get(translationKey);
                    if (translation !== translationKey) {
                        contextualTexts[fieldType] = translation;
                    }
                }
            }
    }

    if (Object.keys(contextualTexts).length) {
        nuObj.contextualTexts = contextualTexts;
    }

    return nuObj;
};
