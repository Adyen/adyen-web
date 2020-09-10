import { IFRAME_TITLE } from '../../../configuration/constants';
import getProp from '../../../../../../../utils/getProp';
import { addErrorTranslationsToObject } from '../../../../../../../core/Errors/utils';
import { AriaConfigObject, AriaConfig } from '../../AbstractSecuredField';

/**
 * Checks if the merchant has defined an ariaConfig object and if so enhances it with a iframeTitle and error property, if they don't already exist
 * If the ariaConfig object doesn't exist then creates one with the default properties
 * In both cases where the error property doesn't exist we extract the correct translation for the field and use that
 */
export function processAriaConfig(configObj, fieldType, i18n) {
    const iframeTitle: string = IFRAME_TITLE;
    let newAriaFieldConfigObj: AriaConfigObject;

    // Check for a pre-existing, merchant defined object and extract properties
    const lang = getProp(configObj, `iframeUIConfig.ariaConfig.lang`);

    const ariaFieldConfig: AriaConfigObject = getProp(configObj, `iframeUIConfig.ariaConfig.${fieldType}`);

    if (ariaFieldConfig) {
        newAriaFieldConfigObj = {
            ...ariaFieldConfig,
            // If object already has a title, use it - else set default
            iframeTitle: ariaFieldConfig.iframeTitle || iframeTitle
        };
    } else {
        // Create a new object with the default title
        newAriaFieldConfigObj = { iframeTitle };
    }

    // Add error translations object
    const ariaFieldConfigWithTranslation = addErrorTranslationsToObject(newAriaFieldConfigObj, i18n);

    // Create a new aria config object keeping the old entries and adding a new one for this field
    // N.B. need to do this deconstruction of the original aria config object to break existing refs & avoid getting an "accumulated" object
    return {
        ...(lang && { lang }),
        [fieldType]: ariaFieldConfigWithTranslation
    } as AriaConfig;
}
