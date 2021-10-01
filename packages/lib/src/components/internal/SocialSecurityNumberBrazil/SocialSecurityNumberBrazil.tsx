import { h } from 'preact';
import renderFormField from '../../internal/FormFields';
import Field from '../../internal/FormFields/Field';
import useCoreContext from '../../../core/Context/useCoreContext';

export default function({ onChange, onInput, valid = false, error = null, data = '' }) {
    const { i18n } = useCoreContext();

    return (
        <Field
            label={`${i18n.get('boleto.socialSecurityNumber')}`}
            classNameModifiers={['socialSecurityNumber']}
            errorMessage={!!error}
            isValid={Boolean(valid)}
        >
            {renderFormField('text', {
                name: 'socialSecurityNumber',
                autocorrect: 'off',
                spellcheck: false,
                value: data,
                maxLength: 18,
                onInput,
                onChange
            })}
        </Field>
    );
}
