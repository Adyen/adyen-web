import { unformatDate } from '../FormFields/InputDate/utils';
import Language from '../../../language';

export const getFormattedData = data => {
    const { firstName, lastName, gender, dateOfBirth, shopperEmail, telephoneNumber } = data;

    return {
        ...((firstName || lastName) && {
            shopperName: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(gender && { gender })
            }
        }),
        ...(dateOfBirth && { dateOfBirth: unformatDate(dateOfBirth) }),
        ...(shopperEmail && { shopperEmail }),
        ...(telephoneNumber && { telephoneNumber })
    };
};

/**
 * Used by the SRPanel sorting function to tell it whether we need to prepend the field type to the SR panel message, and, if so, we retrieve the correct translation for the field type.
 * (Whether we need to prepend the field type depends on whether we know that the error message correctly reflects the label of the field. Ultimately all error messages should do this
 * and this mapping fn will become redundant)
 */
export const mapFieldKey = (key: string, i18n: Language): string => {
    switch (key) {
        case 'gender':
            return i18n.get(key);
        // We know that the translated error messages do contain a reference to the field they refer to, so we won't need to map them
        default:
            return null;
    }
};
