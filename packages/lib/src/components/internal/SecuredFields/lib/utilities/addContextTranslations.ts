import {
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_SECURITY_CODE_3_DIGITS,
    ENCRYPTED_SECURITY_CODE_4_DIGITS
} from '../configuration/constants';

export default (originalObj, i18n, fieldType) => {
    const nuObj = { ...originalObj };

    const contextualTexts = {};

    switch (fieldType) {
        case ENCRYPTED_EXPIRY_DATE:
            contextualTexts[ENCRYPTED_EXPIRY_DATE] = i18n.get('creditCard.expiryDateField.contextualText');
            break;
        case ENCRYPTED_SECURITY_CODE:
            contextualTexts[ENCRYPTED_SECURITY_CODE] = {
                [ENCRYPTED_SECURITY_CODE_3_DIGITS]: i18n.get('creditCard.cvcField.contextualText.3digits'),
                [ENCRYPTED_SECURITY_CODE_4_DIGITS]: i18n.get('creditCard.cvcField.contextualText.4digits')
            };
            break;
        default:
    }

    if (Object.keys(contextualTexts).length) {
        nuObj.contextualTexts = contextualTexts;
    }

    return nuObj;
};
