import getProp from '../../../../../../../utils/getProp';
import { addErrorTranslationsToObject } from '../../../../../../../core/Errors/utils';
import { AriaConfigObject, AriaConfig, SFInternalConfig } from '../../AbstractSecuredField';
import Language from '../../../../../../../language/Language';

/**
 * Checks if the merchant has defined an ariaConfig object and if so enhances it with a iframeTitle and label property, if they don't already exist.
 * If the ariaConfig object doesn't exist at all we create one with these 2 properties.
 * The iframeTitle and label properties, where they don't previously exist are populated with values read from the translation file.
 * In both cases we then add an error object containing the possible errors for any securedField read from the translation file and stored under error-codes
 *
 * NOTE: whilst we allow the merchant to overwrite the translated strings with their own iframeTitle and label we currently don't support this for the error object
 * since this is a more complex object involving special, specific codes
 */
export function processAriaConfig(configObj: SFInternalConfig, fieldType: string, i18n: Language): AriaConfig {
    const type = configObj.txVariant === 'card' ? 'creditCard' : configObj.txVariant;

    // Get translation for iframeTitle
    const iframeTitle: string = i18n.get(`${type}.${fieldType}.aria.iframeTitle`);

    // Get translation for aria label
    const label: string = i18n.get(`${type}.${fieldType}.aria.label`);

    // Get lang property
    const lang = configObj.locale;

    // Ceate a new object with the iframeTitle & label values from translation file
    const ariaFieldConfigObj: AriaConfigObject = { iframeTitle, label };

    // Add error translations object
    const ariaFieldConfigWithTranslatedErrors = addErrorTranslationsToObject(ariaFieldConfigObj, i18n);

    // Create a new aria config object keeping the old entries and adding a new one for this field
    // N.B. need to do this deconstruction of the original aria config object to break existing refs & avoid getting an "accumulated" object
    return {
        ...(lang && { lang }),
        [fieldType]: ariaFieldConfigWithTranslatedErrors
    } as AriaConfig;
}
