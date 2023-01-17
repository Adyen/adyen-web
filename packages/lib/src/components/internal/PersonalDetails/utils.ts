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

export const mapFieldKey = (key: string, i18n: Language): string => {
    switch (key) {
        case 'gender':
        case 'dateOfBirth':
            return i18n.get(key);
        // We know that the translated error messages do contain a reference to the field they refer to, so we won't need to map them
        default:
            return null;
    }
};
