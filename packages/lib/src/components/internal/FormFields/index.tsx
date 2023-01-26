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

export const renderFormField = (type, props: InputBaseProps) => {
    const formFieldTypes = {
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
