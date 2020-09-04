import { resolvePlaceholders } from '../../../../utils';
import { PlaceholdersObject } from '../../AbstractSecuredField';

/**
 * Checks if the merchant has defined an placeholder config object and if not create one with a value from the relevant translation file
 */
export function processPlaceholders(configObj, fieldType, i18n) {
    // Use the merchant defined value - even if an empty string or null
    let placeholderFieldValue: string = configObj.iframeUIConfig.placeholders ? configObj.iframeUIConfig.placeholders[fieldType] : undefined;

    // Only if the value is truly "undefined" then get a translated one
    if (typeof placeholderFieldValue === 'undefined') {
        placeholderFieldValue = resolvePlaceholders(i18n)[fieldType];
    }

    return {
        [fieldType]: placeholderFieldValue
    } as PlaceholdersObject;
}
