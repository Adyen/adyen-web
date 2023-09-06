import { SFPlaceholdersObject } from '../AbstractSecuredField';
import { Placeholders } from '../../../SFP/types';
import {
    ENCRYPTED_BANK_ACCNT_NUMBER_FIELD,
    ENCRYPTED_BANK_LOCATION_FIELD,
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
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
export function processPlaceholders(txVariant: string, fieldType: string, placeholders: Placeholders): SFPlaceholdersObject {
    switch (txVariant) {
        case 'ach':
            switch (fieldType) {
                case ENCRYPTED_BANK_ACCNT_NUMBER_FIELD:
                    return { [ENCRYPTED_BANK_ACCNT_NUMBER_FIELD]: (placeholders as AchPlaceholders).accountNumber ?? '' };
                case ENCRYPTED_BANK_LOCATION_FIELD:
                    return { [ENCRYPTED_BANK_LOCATION_FIELD]: (placeholders as AchPlaceholders).accountLocation ?? '' };
                default:
            }
            break;

        case GIFT_CARD:
            switch (fieldType) {
                case ENCRYPTED_CARD_NUMBER:
                    return { [ENCRYPTED_CARD_NUMBER]: (placeholders as GiftcardPlaceholders).cardNumber ?? '' };

                // Only found in certain giftcards
                case ENCRYPTED_EXPIRY_DATE:
                    return { [ENCRYPTED_EXPIRY_DATE]: (placeholders as GiftcardPlaceholders).expiryDate ?? '' };

                case ENCRYPTED_SECURITY_CODE:
                    return {
                        [ENCRYPTED_SECURITY_CODE]: (placeholders as GiftcardPlaceholders).securityCode ?? ''
                    };
                default:
            }
            break;

        default:
            switch (fieldType) {
                case ENCRYPTED_CARD_NUMBER:
                    return { [ENCRYPTED_CARD_NUMBER]: (placeholders as CardPlaceholders).cardNumber ?? '' };

                case ENCRYPTED_EXPIRY_DATE:
                    return { [ENCRYPTED_EXPIRY_DATE]: (placeholders as CardPlaceholders).expiryDate ?? '' };

                case ENCRYPTED_SECURITY_CODE:
                    return {
                        [ENCRYPTED_SECURITY_CODE_3_DIGITS]: (placeholders as CardPlaceholders).securityCodeThreeDigits ?? '',
                        [ENCRYPTED_SECURITY_CODE_4_DIGITS]: (placeholders as CardPlaceholders).securityCodeFourDigits ?? ''
                    };

                case ENCRYPTED_PWD_FIELD:
                    return { [ENCRYPTED_PWD_FIELD]: (placeholders as CardPlaceholders).password ?? '' };
                default:
            }
    }
}
