import { unformatDate } from '../FormFields/InputDate/utils';

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
