export const validateHolderName = (holderName: string, holderNameRequired = false): boolean => {
    if (holderNameRequired) {
        return !!holderName && typeof holderName === 'string' && holderName.trim().length > 0;
    }

    // Holder name is required...
    const len = holderName.trim().length;
    if (len === 0 && !emptyIsError) {
        return true;
    }

    return len > 0;
};
export default {
    validateHolderName
};
