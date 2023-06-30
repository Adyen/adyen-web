import { h } from 'preact';
import InputText from './InputText';
import InputDate from './InputDate';
import InputTelephone from './InputTelephone';
import InputEmail from './InputEmail';
import RadioGroup from './RadioGroup';
import Checkbox from './Checkbox';
import Select from './Select';
import './FormFields.scss';
import { InputBaseProps } from './InputBase';

type RenderFormFieldTypes = {
    boolean: typeof Checkbox;
    radio: typeof RadioGroup;
    select: typeof Select;
    date: typeof InputDate;
    emailAddress: typeof InputEmail;
    tel: typeof InputTelephone;
    text: typeof InputText;
    default: typeof InputText;
};

// for testing purposes
// type possibleFieldsType =
//     | typeof Checkbox
//     | typeof RadioGroup
//     | typeof Select
//     | typeof InputDate
//     | typeof InputEmail
//     | typeof InputTelephone
//     | typeof InputText;
export const renderFormField = (type: keyof RenderFormFieldTypes, props: InputBaseProps) => {
    const formFieldTypes: RenderFormFieldTypes = {
        boolean: Checkbox,
        radio: RadioGroup,
        select: Select,
        // All the following use InputBase
        date: InputDate,
        emailAddress: InputEmail,
        tel: InputTelephone,
        text: InputText,
        default: InputText
    };

    const FormInputElement = formFieldTypes[type] || formFieldTypes.default;

    return <FormInputElement {...props} />;
};

export default renderFormField;
