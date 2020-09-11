export const companyDetailsValidationRules = {
    blur: {
        default: value => {
            const isValid: boolean = value && value.length > 0;
            return { isValid: isValid, errorMessage: true };
        }
    }
};
