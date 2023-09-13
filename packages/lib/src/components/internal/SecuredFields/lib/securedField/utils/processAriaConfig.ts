import { addErrorTranslationsToObject } from '../../../../../../core/Errors/utils';
import addContextTranslationsToObject from '../../utilities/addContextTranslations';
import { AriaConfigObject, AriaConfig } from '../AbstractSecuredField';
import Language from '../../../../../../language/Language';
import { SF_FIELDS_MAP } from '../../configuration/constants';

/**
 * Creates an ariaConfig object with 'iframeTitle' and 'label' properties, whose values are retrieved from the translations object.
 * (These values either come from the translation file or have been overwritten by the merchant in a translations config object.)
 * We then add an error object containing the possible errors for any securedField read from the translation file and stored under error-codes
 */
export function processAriaConfig(txVariant: string, fieldType: string, i18n: Language, showContextuaElement): AriaConfig {
    // txVariant can be the scheme name (VISA, Mastercard...) so we put all of them under creditCard
    const type = ['ach', 'giftcard'].includes(txVariant) ? txVariant : 'creditCard';

    // Get translation for iframeTitle
    const iframeTitle: string = i18n.get(`${type}.${fieldType}.aria.iframeTitle`);

    console.log('### processAriaConfig::type & fieldType:: ', type, fieldType);

    // Get translation for aria label using same key used to label the element
    // const label: string = i18n.get(`${type}.${fieldType}.aria.label`);
    const label: string = i18n.get(`${type}.${SF_FIELDS_MAP[fieldType]}.label`);

    // Get lang property
    const lang = i18n.locale;

    // Create a new object with the iframeTitle & label values from translation file
    const ariaFieldConfigObj: AriaConfigObject = { iframeTitle, label };

    // Add error translations object
    let enhancedAriaFieldConfigObj = addErrorTranslationsToObject(ariaFieldConfigObj, i18n, fieldType);

    // If allowed, add the translated contextual texts
    if (showContextuaElement) {
        enhancedAriaFieldConfigObj = addContextTranslationsToObject(enhancedAriaFieldConfigObj, i18n, txVariant, fieldType);
    }

    // Create a new aria config object keeping the old entries and adding a new one for this field
    // N.B. need to do this deconstruction of the original aria config object to break existing refs & avoid getting an "accumulated" object
    return {
        ...(lang && { lang }),
        [fieldType]: enhancedAriaFieldConfigObj
    } as AriaConfig;
}
