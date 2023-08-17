import { SFPlaceholdersObject, SFInternalConfig } from '../AbstractSecuredField';
import { Placeholders } from '../../../SFP/types';
import {
    ENCRYPTED_BANK_ACCNT_NUMBER_FIELD,
    ENCRYPTED_BANK_LOCATION_FIELD,
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_SECURITY_CODE_3_DIGITS,
    ENCRYPTED_SECURITY_CODE_4_DIGITS,
    GIFT_CARD
} from '../../configuration/constants';
import { Placeholders as AchPlaceholders } from '../../../../../Ach/components/AchInput/types';
import { Placeholders as GiftcardPlaceholders } from '../../../../../Giftcard/components/types';
import { Placeholders as CardPlaceholders } from '../../../../../Card/components/CardInput/types';

/**
 * Create placeholders with a value from merchant's configuration
 */
export function processPlaceholders(configObj: SFInternalConfig, placeholders: Placeholders): SFPlaceholdersObject {
    const defaultPlaceholders = {
        [ENCRYPTED_CARD_NUMBER]: '',
        [ENCRYPTED_EXPIRY_DATE]: '',
        [ENCRYPTED_EXPIRY_MONTH]: '',
        [ENCRYPTED_EXPIRY_YEAR]: '',
        [ENCRYPTED_SECURITY_CODE]: '', // Used for gift cards
        [ENCRYPTED_SECURITY_CODE_3_DIGITS]: '',
        [ENCRYPTED_SECURITY_CODE_4_DIGITS]: '',
        [ENCRYPTED_PWD_FIELD]: '',
        [ENCRYPTED_BANK_ACCNT_NUMBER_FIELD]: '',
        [ENCRYPTED_BANK_LOCATION_FIELD]: ''
    };
    switch (configObj.txVariant) {
        case 'ach':
            return {
                ...defaultPlaceholders,
                [ENCRYPTED_BANK_ACCNT_NUMBER_FIELD]: (placeholders as AchPlaceholders).accountNumber ?? '',
                [ENCRYPTED_BANK_LOCATION_FIELD]: (placeholders as AchPlaceholders).accountLocation ?? ''
            };
        case GIFT_CARD:
            return {
                ...defaultPlaceholders,
                [ENCRYPTED_CARD_NUMBER]: (placeholders as GiftcardPlaceholders).cardNumber ?? '',
                [ENCRYPTED_EXPIRY_DATE]: (placeholders as GiftcardPlaceholders).expiryDate ?? '',
                [ENCRYPTED_SECURITY_CODE]: (placeholders as GiftcardPlaceholders).securityCode ?? ''
            };
        default:
            return {
                ...defaultPlaceholders,
                [ENCRYPTED_CARD_NUMBER]: (placeholders as CardPlaceholders).cardNumber ?? '',
                [ENCRYPTED_EXPIRY_DATE]: (placeholders as CardPlaceholders).expirationDate ?? '',
                [ENCRYPTED_SECURITY_CODE_3_DIGITS]: (placeholders as CardPlaceholders).securityCode ?? '',
                [ENCRYPTED_SECURITY_CODE_4_DIGITS]: (placeholders as CardPlaceholders).securityCode ?? '',
                [ENCRYPTED_PWD_FIELD]: (placeholders as CardPlaceholders).password ?? ''
            };
    }
}
