import { h } from 'preact';
import Field from '../../internal/FormFields/Field';
import useCoreContext from '../../../core/Context/useCoreContext';
import InputText from '../FormFields/InputText';

export default function ({ onBlur, onInput, valid = false, error = null, data = '', required = false, disabled = false }) {
    const { i18n } = useCoreContext();

    return (
        <Field
            label={`${i18n.get('boleto.socialSecurityNumber')}`}
            classNameModifiers={['socialSecurityNumber']}
            errorMessage={error && error.errorMessage ? i18n.get(error.errorMessage) : !!error}
            isValid={Boolean(valid)}
            name={'socialSecurityNumber'}
        >
            <InputText
                name={'socialSecurityNumber'}
                autocorrect={'off'}
                spellcheck={false}
                value={data}
                maxLength={18}
                onInput={onInput}
                onBlur={onBlur}
                required={required}
                disabled={disabled}
            />
        </Field>
    );
}
