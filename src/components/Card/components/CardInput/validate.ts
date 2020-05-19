export const validateHolderName = (holderName: string, holderNameRequired: boolean = false): boolean => {
    if (holderNameRequired) {
        return !!holderName && typeof holderName === 'string' && holderName.trim().length > 0;
    }

    return true;
};

export default {
    validateHolderName
};
