import { h } from 'preact';
import Field from '../../internal/FormFields/Field';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import InputText from '../FormFields/InputText';

const SocialSecurityNumberBrazil = ({
    onBlur,
    onInput,
    valid = false,
    error = null,
    data = '',
    required = false,
    disabled = false,
    onFieldFocusAnalytics = null,
    onFieldBlurAnalytics = null
}) => {
    const { i18n } = useCoreContext();

    return (
        <Field
            label={`${i18n.get('boleto.socialSecurityNumber')}`}
            classNameModifiers={['socialSecurityNumber']}
            errorMessage={error && error.errorMessage ? i18n.get(error.errorMessage) : !!error}
            isValid={Boolean(valid)}
            name={'socialSecurityNumber'}
            onFocus={e => onFieldFocusAnalytics?.('socialSecurityNumber', e)}
            onBlur={e => onFieldBlurAnalytics?.('socialSecurityNumber', e)}
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
};

export default SocialSecurityNumberBrazil;
