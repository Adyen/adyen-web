import { resolvePlaceholders } from '../../../../utils';
import { PlaceholdersObject } from '../../AbstractSecuredField';

/**
 * Checks if the merchant has defined an placeholder config object and if not create one with a value from the relevant translation file
 */
export function processPlaceholders(configObj, fieldType, i18n) {
    let placeholderFieldValue: string = configObj.iframeUIConfig.placeholders ? configObj.iframeUIConfig.placeholders[fieldType] : undefined;

    // If no value set by merchant - get translated one
    if (typeof placeholderFieldValue === 'undefined') {
        placeholderFieldValue = resolvePlaceholders(i18n)[fieldType];
    }

    return {
        ...configObj.iframeUIConfig.placeholders,
        [fieldType]: placeholderFieldValue
    } as PlaceholdersObject;
}
