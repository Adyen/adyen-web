import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import useCoreContext from '../../../../core/Context/useCoreContext';
import Field from '../../../internal/FormFields/Field';
import { renderFormField } from '../../../internal/FormFields';
import { MBWayDataState, MBWayInputProps } from './types';
import './MBWayInput.scss';
import useForm from '../../../../utils/useForm';
const phoneNumberRegEx = /^[+]*[0-9]{1,4}[\s/0-9]*$/;

function MBWayInput(props: MBWayInputProps) {
    const { i18n } = useCoreContext();

    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<MBWayDataState>({
        schema: ['telephoneNumber'],
        defaultData: props.data,
        rules: {
            telephoneNumber: {
                validate: num => phoneNumberRegEx.test(num) && num.length >= 7,
                errorMessage: 'mobileNumber.invalid',
                modes: ['blur']
            }
        },
        formatters: {
            telephoneNumber: num => num.replace(/[^0-9+\s]/g, '')
        }
    });

    const [status, setStatus] = useState('ready');

    this.setStatus = setStatus;
    this.showValidation = triggerValidation;

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    return (
        <div className="adyen-checkout__mb-way">
            <Field
                errorMessage={!!errors.telephoneNumber && i18n.get('mobileNumber.invalid')}
                label={i18n.get('mobileNumber')}
                className={classNames('adyen-checkout__input--phone-number')}
                isValid={valid.telephoneNumber}
            >
                {renderFormField('tel', {
                    value: data.telephoneNumber,
                    className: 'adyen-checkout__pm__phoneNumber__input',
                    placeholder: props.placeholders.telephoneNumber,
                    required: true,
                    autoCorrect: 'off',
                    onChange: handleChangeFor('telephoneNumber', 'blur'),
                    onInput: handleChangeFor('telephoneNumber', 'input')
                })}
            </Field>

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}

MBWayInput.defaultProps = {
    onChange: () => {}
};

export default MBWayInput;
