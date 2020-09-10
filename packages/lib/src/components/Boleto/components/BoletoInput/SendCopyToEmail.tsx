import { h } from 'preact';
import { useState } from 'preact/hooks';
import { renderFormField } from '../../../internal/FormFields';
import useCoreContext from '../../../../core/Context/useCoreContext';
import Field from '../../../internal/FormFields/Field';

export default function SendCopyToEmail(props) {
    const { errors, value, onInput, onChange } = props;
    const { i18n } = useCoreContext();
    const [sendCopyToEmail, setSendCopyToEmail] = useState(false);

    const toggleEmailField = e => {
        setSendCopyToEmail(e.target.checked);
        props.onToggle(sendCopyToEmail);
    };

    return (
        <div className={'adyen-checkout__fieldset adyen-checkout__fieldset--sendCopyToEmail'}>
            <Field classNameModifiers={['sendCopyToEmail']}>
                {renderFormField('boolean', {
                    onChange: toggleEmailField,
                    label: i18n.get('boleto.sendCopyToEmail'),
                    name: 'sendCopyToEmail',
                    value: sendCopyToEmail
                })}
            </Field>

            {sendCopyToEmail && (
                <Field label={i18n.get('shopperEmail')} classNameModifiers={['shopperEmail']} errorMessage={errors}>
                    {renderFormField('emailAddress', {
                        name: 'boleto.shopperEmail',
                        autoCorrect: 'off',
                        spellCheck: false,
                        value,
                        onInput,
                        onChange
                    })}
                </Field>
            )}
        </div>
    );
}
