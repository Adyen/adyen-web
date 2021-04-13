import { ValidatorRules } from '../../../../utils/Validator/Validator';

export const validateHolderName = (holderName: string, holderNameRequired = false, emptyIsError = true): boolean => {
    // if (holderNameRequired) {
    //     return !!holderName && typeof holderName === 'string' && holderName.trim().length > 0;
    // }
    //
    // return true;

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

const nonLetterRegEx = /[^A-Z\s]/gi; // detect anything that's not a letter or spaces

export const cardInputFormatters = {
    holderName: value => value.replace(nonLetterRegEx, '')
};

// export const cardInputValidationRules: ValidatorRules = {
//     holderName: [
//         {
//             modes: ['input'],
//             validate: value => !!value // && /^[A-Z\s]{1,6}$/gi.test(value)
//         }
//         // {
//         //     modes: ['blur'],
//         //     validate: value => typeof value === 'string' && value.trim().length > 0
//         // }
//     ],
//     default: {
//         validate: value => !!value && value.length > 0,
//         modes: ['input']
//     }
// };

export const cardInputValidationRules: ValidatorRules = {
    holderName: [
        // {
        //     // holderName only really has an onInput handler 'cos of the way an InputText is built...
        //     modes: ['input'],
        //     validate: value => {
        //         console.log('### validate::holderName::onInput::trimmed value.length>0 value=', value);
        //         return value.trim().length > 0; // are there some other chars other than spaces?
        //     }
        // },
        {
            // Will fire at startup and when triggerValidation is called
            // and 'cos of the way an InputText is built will also fire onInput
            modes: ['blur'],
            validate: value => {
                console.log('### validate::holderName::onBlur:trimmed value.length>0 value=', value);
                // return true;
                return value.trim().length > 0;
            }
        }
    ],
    default: [
        // {
        //     modes: ['input'],
        //     validate: value => {
        //         console.log('### validate::default::onInput::!!value (true if not empty) value=', value, 'return=', !!value);
        //         return true; //!!value;
        //     }
        // }
        {
            modes: ['blur'],
            validate: value => {
                // console.log('### validate::default::onBlur:trimmed value.length>0 value=', value, 'return=', value.trim().length > 0);
                console.log('### validate::default::onBlur:trimmed value.length>0 value=', value, 'return=always true');
                return value.trim().length > 0;
            }
        }
    ]
};
