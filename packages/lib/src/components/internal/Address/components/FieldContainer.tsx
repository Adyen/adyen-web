import { h } from 'preact';
import Field from '../../FormFields/Field';
import { renderFormField } from '../../FormFields';
import { getFieldLabelKey } from '../utils';

function FieldContainer(props) {
    const { classNameModifiers, data, errors, fieldName, i18n, onInput } = props;
    const labelKey = getFieldLabelKey(fieldName, data.country);

    return (
        <Field label={i18n.get(labelKey)} classNameModifiers={[...classNameModifiers, fieldName]} errorMessage={!!errors[fieldName]}>
            {renderFormField('text', {
                name: fieldName,
                value: data[fieldName],
                classNameModifiers: [fieldName],
                onInput
            })}
        </Field>
    );
}

export default FieldContainer;
