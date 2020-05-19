//const emailRegEx = /\S+@\S+\.\S+/;
/* eslint-disable max-len */
const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/* eslint-enable max-len */
const phoneNumberRegEx = /^[+]*[0-9]{1,4}[\s/0-9]*$/;

export const mbwayValidationRules: object = {
    input: {
        email: (email): object => {
            return { isValid: emailRegEx.test(email), value: email };
        },
        phoneNumber: (num): object => {
            // Format
            const regEx = /[^0-9+\s]/g;
            const formattedVal: string = num.replace(regEx, '');
            // Validate
            const isValid: boolean = phoneNumberRegEx.test(formattedVal) && formattedVal && formattedVal.length >= 7;

            return { isValid, value: formattedVal };
        },
        default: (value): boolean => value && value.length > 0
    },
    blur: {
        email: (email): object => {
            return { isValid: emailRegEx.test(email), value: email };
        },
        phoneNumber: (num): object => {
            // Just validate
            return { isValid: phoneNumberRegEx.test(num) && num && num.length >= 7, value: num };
        },
        default: (value): boolean => value && value.length > 0
    }
};
