import { h } from 'preact';
import renderFormField from '../../internal/FormFields';
import Field from '../../internal/FormFields/Field';
import useCoreContext from '../../../core/Context/useCoreContext';

export default function({ onChange, onInput, valid = false, error = null, data = '', required = false, isCollatingErrors = false }) {
    const { i18n } = useCoreContext();

    return (
        <Field
            label={`${i18n.get('boleto.socialSecurityNumber')}`}
            classNameModifiers={['socialSecurityNumber']}
            errorMessage={error && error.errorMessage ? i18n.get(error.errorMessage) : !!error}
            isValid={Boolean(valid)}
            name={'socialSecurityNumber'}
            isCollatingErrors={isCollatingErrors}
        >
            {renderFormField('text', {
                name: 'socialSecurityNumber',
                autocorrect: 'off',
                spellcheck: false,
                value: data,
                maxLength: 18,
                onInput,
                onChange,
                required,
                isCollatingErrors
            })}
        </Field>
    );
}
