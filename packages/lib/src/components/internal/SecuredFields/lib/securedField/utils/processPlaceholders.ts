import { SFPlaceholdersObject } from '../../types';
import { Placeholders } from '../../../SFP/types';
import {
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_SECURITY_CODE_3_DIGITS,
    ENCRYPTED_SECURITY_CODE_4_DIGITS,
    GIFT_CARD,
    SF_FIELDS_MAP
} from '../../constants';
import { Placeholders as GiftcardPlaceholders } from '../../../../../Giftcard/components/types';
import { Placeholders as CardPlaceholders } from '../../../../../Card/components/CardInput/types';

/**
 * Create placeholders with a value from merchant's configuration
 *
 * Based on txVariant & fieldType, maps the entries in the passed placeholders object to create a field specific placeholder object
 */
export function processPlaceholders(txVariant: string, fieldType: string, placeholders: Placeholders): SFPlaceholdersObject {
    switch (txVariant) {
        case GIFT_CARD:
            return { [fieldType]: (placeholders as GiftcardPlaceholders)[SF_FIELDS_MAP[fieldType]] ?? '' };

        default:
            switch (fieldType) {
                case ENCRYPTED_SECURITY_CODE:
                    return {
                        [ENCRYPTED_SECURITY_CODE_3_DIGITS]: (placeholders as CardPlaceholders).securityCodeThreeDigits ?? '',
                        [ENCRYPTED_SECURITY_CODE_4_DIGITS]: (placeholders as CardPlaceholders).securityCodeFourDigits ?? ''
                    };

                default:
                    return { [fieldType]: (placeholders as CardPlaceholders)[SF_FIELDS_MAP[fieldType]] ?? '' };
            }
    }
}
