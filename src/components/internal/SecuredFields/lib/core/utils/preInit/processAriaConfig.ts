import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import { CSF_FIELDS_ARRAY, IFRAME_TITLE } from '../../../configuration/constants';
import getProp from '../../../../../../../utils/getProp';
import { addErrorTranslationToObject } from '../../../../utils';
import { AriaConfigObject, ProcessedAriaConfigObject } from '../../AbstractSecuredField';

// Ensure all fields have a related ariaConfig object containing, at minimum, an iframeTitle property and a (translated) error
export function processAriaConfig(configObj, fieldType) {
    const { i18n } = useCoreContext();
    let iframeTitle: string = IFRAME_TITLE;
    const ariaFieldConfig: AriaConfigObject = getProp(configObj, `iframeUIConfig.ariaConfig.${fieldType}`);

    let newAriaFieldConfigObj: AriaConfigObject;
    let ariaFieldConfigWithTranslation: AriaConfigObject;

    if (ariaFieldConfig) {
        newAriaFieldConfigObj = {
            ...ariaFieldConfig,
            // If object already has a title, use it - else set default
            iframeTitle: ariaFieldConfig.iframeTitle || iframeTitle
        };

        // Set iframeTitle to value from config object
        iframeTitle = newAriaFieldConfigObj.iframeTitle;

        // Add error translation
        ariaFieldConfigWithTranslation = addErrorTranslationToObject(newAriaFieldConfigObj, fieldType, i18n, CSF_FIELDS_ARRAY);
    } else {
        // Create a new object with the default title
        newAriaFieldConfigObj = { iframeTitle };
        // Add error translation
        ariaFieldConfigWithTranslation = addErrorTranslationToObject(newAriaFieldConfigObj, fieldType, i18n, CSF_FIELDS_ARRAY);
    }

    return {
        // Create a new aria config object keeping the old entries and adding a new one for this field
        // N.B. need to do this deconstruction of the original aria config object to break existing refs & avoid getting an "accumulated" object
        ariaConfig: {
            ...configObj.iframeUIConfig.ariaConfig,
            [fieldType]: ariaFieldConfigWithTranslation
        },
        // Either default title or one retrieved from the config object
        iframeTitle
    } as ProcessedAriaConfigObject;
}
