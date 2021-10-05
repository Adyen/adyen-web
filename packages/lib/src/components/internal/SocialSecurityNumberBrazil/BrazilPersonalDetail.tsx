import Field from '../FormFields/Field';
import { renderFormField } from '../FormFields';
import SocialSecurityNumberBrazil from './SocialSecurityNumberBrazil';
import { h } from 'preact';

export function BrazilPersonalDetail(props) {
    const { i18n, data, handleChangeFor, errors, valid } = props;
    return (
        <div className={'adyen-checkout__fieldset adyen-checkout__fieldset--address adyen-checkout__fieldset--personalDetails'}>
            <div className="adyen-checkout__fieldset__title">{i18n.get('personalDetails')}</div>

            <div className="adyen-checkout__fieldset__fields">
                <Field label={i18n.get('firstName')} classNameModifiers={['firstName', 'col-50']} errorMessage={!!errors.firstName}>
                    {renderFormField('text', {
                        name: 'firstName',
                        autocorrect: 'off',
                        spellcheck: false,
                        value: data.firstName,
                        onInput: handleChangeFor('firstName', 'input'),
                        onChange: handleChangeFor('firstName')
                    })}
                </Field>

                <Field label={i18n.get('lastName')} classNameModifiers={['lastName', 'col-50']} errorMessage={!!errors.lastName}>
                    {renderFormField('text', {
                        name: 'lastName',
                        autocorrect: 'off',
                        spellcheck: false,
                        value: data.lastName,
                        onInput: handleChangeFor('lastName', 'input'),
                        onChange: handleChangeFor('lastName')
                    })}
                </Field>

                <SocialSecurityNumberBrazil
                    data={data.socialSecurityNumber}
                    error={errors.socialSecurityNumber}
                    valid={valid.socialSecurityNumber}
                    onInput={handleChangeFor('socialSecurityNumber', 'input')}
                    onChange={handleChangeFor('socialSecurityNumber')}
                />
            </div>
        </div>
    );
}
