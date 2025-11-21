import { unformatDate } from '../FormFields/InputDate/utils';
import { PersonalDetailsSchema } from '../../../types/global-types';

export const getFormattedData = (data: PersonalDetailsSchema) => {
    const { firstName, lastName, dateOfBirth, shopperEmail, telephoneNumber } = data;

    return {
        ...((firstName || lastName) && {
            shopperName: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName })
            }
        }),
        ...(dateOfBirth && { dateOfBirth: unformatDate(dateOfBirth) }),
        ...(shopperEmail && { shopperEmail }),
        ...(telephoneNumber && { telephoneNumber })
    };
};
