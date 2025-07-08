import { h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import './BankTransferInput.scss';
import { useEffect, useRef } from 'preact/hooks';
import useForm from '../../../../utils/useForm';
import { BankTransferSchema } from '../../types';
import { getErrorMessage } from '../../../../utils/getErrorMessage';
import InputEmail from '../../../internal/FormFields/InputEmail';
import Field from '../../../internal/FormFields/Field';
import { optionalEmailValidationRule } from './validationRule';
import { BankTransferInputProps } from './types';

function BankTransferInput(props: Readonly<BankTransferInputProps>) {
    const { i18n } = useCoreContext();
    const emailOptionalLabel = `${i18n.get('shopperEmail')} ${i18n.get('field.title.optional')}`;

    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<BankTransferSchema>({
        schema: ['shopperEmail'],
        defaultData: props.data,
        rules: {
            shopperEmail: optionalEmailValidationRule
        }
    });

    const self = useRef({
        showValidation: () => {
            triggerValidation();
        }
    });

    useEffect(() => {
        props.onChange({ data, errors, valid, isValid });
    }, [data, valid, errors, isValid]);

    useEffect(() => {
        props.setComponentRef(self.current);
    }, [props.setComponentRef]);

    return (
        <div className="adyen-checkout__bankTransfer">
            <p className="adyen-checkout__bankTransfer__introduction">{i18n.get('bankTransfer.introduction')}</p>
            <div className="adyen-checkout__fieldset adyen-checkout__fieldset--sendCopyToEmail adyen-checkout__bankTransfer__emailField">
                <Field
                    label={emailOptionalLabel}
                    classNameModifiers={['shopperEmail']}
                    errorMessage={!!errors.shopperEmail && getErrorMessage(i18n, errors.shopperEmail, i18n.get('shopperEmail'))}
                    isValid={valid.shopperEmail}
                    name={'shopperEmail'}
                    showContextualElement={props.showContextualElement}
                    contextualText={i18n.get('bankTransfer.shopperEmail.contextualText')}
                >
                    <InputEmail
                        name={'shopperEmail'}
                        autoCorrect={'off'}
                        spellCheck={false}
                        required={false}
                        value={data.shopperEmail}
                        onInput={handleChangeFor('shopperEmail', 'input')}
                        onBlur={handleChangeFor('shopperEmail', 'blur')}
                    />
                </Field>
            </div>
        </div>
    );
}

export default BankTransferInput;
