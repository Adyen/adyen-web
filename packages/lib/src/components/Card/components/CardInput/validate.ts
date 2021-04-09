export const validateHolderName = (holderName: string, holderNameRequired = false, emptyIsError = true): boolean => {
    if (!holderNameRequired) {
        return true;
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
