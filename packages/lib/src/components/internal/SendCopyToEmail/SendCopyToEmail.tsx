import { h } from 'preact';
import cx from 'classnames';
import { useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import Field from '../FormFields/Field';
import Checkbox from '../FormFields/Checkbox';
import InputEmail from '../FormFields/InputEmail';

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
            <Field classNameModifiers={['sendCopyToEmail']} name={'sendCopyToEmail'} useLabelElement={false} addContextualElement={false}>
                <Checkbox onChange={toggleEmailField} label={i18n.get('boleto.sendCopyToEmail')} name={'sendCopyToEmail'} />
            </Field>

            {sendCopyToEmail && (
                <Field
                    label={i18n.get('shopperEmail')}
                    classNameModifiers={['shopperEmail']}
                    errorMessage={errors && errors.errorMessage ? i18n.get(errors.errorMessage) : !!errors}
                    name={'shopperEmail'}
                >
                    <InputEmail name={'shopperEmail'} autoCorrect={'off'} spellCheck={false} value={value} onInput={onInput} onBlur={onBlur} />
                </Field>
            )}
        </div>
    );
}
