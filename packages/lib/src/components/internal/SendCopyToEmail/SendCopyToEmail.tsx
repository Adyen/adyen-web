import { h } from 'preact';
import cx from 'classnames';
import { useState } from 'preact/hooks';
import { renderFormField } from '../FormFields';
import useCoreContext from '../../../core/Context/useCoreContext';
import Field from '../FormFields/Field';

export default function SendCopyToEmail(props) {
    const { errors, value, onInput, onBlur } = props;
    const { i18n } = useCoreContext();
    const [sendCopyToEmail, setSendCopyToEmail] = useState(false);

    const toggleEmailField = e => {
        setSendCopyToEmail(e.target.checked);
        props.onToggle(sendCopyToEmail);
    };

    return (
        <div className={cx('adyen-checkout__fieldset', 'adyen-checkout__fieldset--sendCopyToEmail', props.classNames)}>
            <Field classNameModifiers={['sendCopyToEmail']}>
                {renderFormField('boolean', {
                    onChange: toggleEmailField,
                    label: i18n.get('boleto.sendCopyToEmail'),
                    name: 'sendCopyToEmail',
                    value: sendCopyToEmail
                })}
            </Field>

            {sendCopyToEmail && (
                <Field
                    label={i18n.get('shopperEmail')}
                    classNameModifiers={['shopperEmail']}
                    errorMessage={errors && errors.errorMessage ? i18n.get(errors.errorMessage) : !!errors}
                    name={'shopperEmail'}
                >
                    {renderFormField('emailAddress', {
                        name: 'shopperEmail',
                        autoCorrect: 'off',
                        spellCheck: false,
                        value,
                        onInput,
                        onBlur
                    })}
                </Field>
            )}
        </div>
    );
}
