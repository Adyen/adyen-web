import { h } from 'preact';
import InputText from './InputText';
import InputDate from './InputDate';
import InputTelephone from './InputTelephone';
import InputEmail from './InputEmail';
import RadioGroup from './RadioGroup';
import Checkbox from './Checkbox';
import Select from './Select';
import SelectList from './SelectList';

import './FormFields.scss';

export const renderFormField = (type, props) => {
    const formFieldTypes = {
        boolean: Checkbox,
        date: InputDate,
        emailAddress: InputEmail,
        radio: RadioGroup,
        select: Select,
        selectList: SelectList,
        tel: InputTelephone,
        text: InputText,
        default: InputText
    };

    const FormInputElement = formFieldTypes[type] || formFieldTypes.default;

    return <FormInputElement {...props} />;
};

export default renderFormField;
