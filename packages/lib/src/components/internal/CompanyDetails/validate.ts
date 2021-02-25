export const companyDetailsValidationRules = {
    default: {
        validate: value => {
            return value && value.length > 0;
        },
        modes: ['blur']
    }
};
