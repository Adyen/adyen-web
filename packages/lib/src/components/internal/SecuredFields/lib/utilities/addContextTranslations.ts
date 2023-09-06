import {
    ENCRYPTED_BANK_ACCNT_NUMBER_FIELD,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_SECURITY_CODE_3_DIGITS,
    ENCRYPTED_SECURITY_CODE_4_DIGITS,
    GIFT_CARD
} from '../configuration/constants';

export default (originalObj, i18n, txVariant, fieldType) => {
    const nuObj = { ...originalObj };

    const contextualTexts = {};

    switch (txVariant) {
        case 'ach':
            contextualTexts[ENCRYPTED_BANK_ACCNT_NUMBER_FIELD] = i18n.get('ach.accountHolderNameField.contextualText');
            break;
        case GIFT_CARD:
            // TODO - when we know the required texts
            break;
        default:
            // Use field type to only add the texts specific to the securedField
            switch (fieldType) {
                case ENCRYPTED_EXPIRY_DATE:
                    contextualTexts[ENCRYPTED_EXPIRY_DATE] = i18n.get('creditCard.expiryDateField.contextualText');
                    break;

                case ENCRYPTED_SECURITY_CODE:
                    contextualTexts[ENCRYPTED_SECURITY_CODE_3_DIGITS] = i18n.get('creditCard.cvcField.contextualText.3digits');
                    contextualTexts[ENCRYPTED_SECURITY_CODE_4_DIGITS] = i18n.get('creditCard.cvcField.contextualText.4digits');
                    break;
                default:

                // TODO - when we know the required text
                // contextualTexts[ENCRYPTED_PWD_FIELD] = i18n.get(); // Only for KCP cards
            }
    }

    if (Object.keys(contextualTexts).length) {
        nuObj.contextualTexts = contextualTexts;
    }

    return nuObj;
};
