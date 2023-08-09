import Field from '../FormFields/Field';
import SocialSecurityNumberBrazil from './SocialSecurityNumberBrazil';
import { h } from 'preact';
import InputText from '../FormFields/InputText';

export function BrazilPersonalDetail(props) {
    const { i18n, data, handleChangeFor, errors, valid } = props;
    const getErrorMessage = error => (error && error.errorMessage ? i18n.get(error.errorMessage) : !!error);
    return (
        <div className={'adyen-checkout__fieldset adyen-checkout__fieldset--address adyen-checkout__fieldset--personalDetails'}>
            <div className="adyen-checkout__fieldset__title">{i18n.get('personalDetails')}</div>

            <div className="adyen-checkout__fieldset__fields">
                <Field
                    label={i18n.get('firstName')}
                    classNameModifiers={['firstName', 'col-50']}
                    errorMessage={getErrorMessage(errors.firstName)}
                    name={'firstName'}
                >
                    <InputText
                        name={'firstName'}
                        autocorrect={'off'}
                        spellcheck={false}
                        value={data.firstName}
                        onInput={handleChangeFor('firstName', 'input')}
                        onBlur={handleChangeFor('firstName', 'blur')}
                    />
                </Field>

                <Field
                    label={i18n.get('lastName')}
                    classNameModifiers={['lastName', 'col-50']}
                    errorMessage={getErrorMessage(errors.lastName)}
                    name={'lastName'}
                >
                    <InputText
                        name={'lastName'}
                        autocorrect={'off'}
                        spellcheck={false}
                        value={data.lastName}
                        onInput={handleChangeFor('lastName', 'input')}
                        onBlur={handleChangeFor('lastName', 'blur')}
                    />
                </Field>

                <SocialSecurityNumberBrazil
                    data={data.socialSecurityNumber}
                    error={errors.socialSecurityNumber}
                    valid={valid.socialSecurityNumber}
                    onInput={handleChangeFor('socialSecurityNumber', 'input')}
                    onBlur={handleChangeFor('socialSecurityNumber', 'blur')}
                />
            </div>
        </div>
    );
}
