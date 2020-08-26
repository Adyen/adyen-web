import getProp from '../../../../../../../utils/getProp';
import { resolvePlaceholders } from '../../../../utils';
import { PlaceholdersObject } from '../../AbstractSecuredField';

// Ensure all fields have a related ariaConfig object containing, at minimum, an iframeTitle property and a (translated) error
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
