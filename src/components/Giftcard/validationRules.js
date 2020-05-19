const validationRules = {
    blur: {
        number: number => /[0-9a-zA-Z]{6,}/.test(number),
        cvc: cvc => /[0-9a-zA-Z]{3,}/.test(cvc)
    }
};

export default validationRules;
