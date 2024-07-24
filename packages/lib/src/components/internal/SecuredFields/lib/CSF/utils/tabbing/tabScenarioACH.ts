import { ENCRYPTED_BANK_ACCNT_NUMBER_FIELD, ENCRYPTED_BANK_LOCATION_FIELD } from '../../../constants';
import { SFFieldType, ShiftTabObject } from '../../../types';

// ACH scenario: bankAccountNumber SF followed by a bankLocationId SF
export function shiftTabACH(fieldType: SFFieldType): ShiftTabObject {
    let additionalField: HTMLElement;
    let fieldToFocus: SFFieldType;

    if (fieldType === ENCRYPTED_BANK_LOCATION_FIELD) {
        fieldToFocus = ENCRYPTED_BANK_ACCNT_NUMBER_FIELD;
    }

    return {
        fieldToFocus,
        additionalField
    };
}
