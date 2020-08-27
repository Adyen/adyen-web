import getProp from '../../../../../../../utils/getProp';
import { resolvePlaceholders } from '../../../../utils';
import { PlaceholdersObject } from '../../AbstractSecuredField';

/**
 * Checks if the merchant has defined an placeholder config object and if not create one with a value from the relevant translation file
 */
export function processPlaceholders(configObj, fieldType, i18n) {
    let placeholderFieldValue: string = getProp(configObj, `iframeUIConfig.placeholders.${fieldType}`);

    // If no value set by merchant - get translated one
    if (!placeholderFieldValue) {
        placeholderFieldValue = resolvePlaceholders(i18n)[fieldType];
    }

    return {
        ...configObj.iframeUIConfig.placeholders,
        [fieldType]: placeholderFieldValue
    } as PlaceholdersObject;
}
