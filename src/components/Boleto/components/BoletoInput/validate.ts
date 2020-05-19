export const boletoValidationRules = {
    input: {
        socialSecurityNumber: ssn => /(^\d{3}\.\d{3}\.\d{3}-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$)/.test(ssn)
    },
    blur: {
        socialSecurityNumber: ssn => /(^\d{3}\.\d{3}\.\d{3}-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$)/.test(ssn),
        default: value => value && value.length > 0
    }
};
