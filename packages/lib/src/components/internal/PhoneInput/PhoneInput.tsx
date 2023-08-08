import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import classNames from 'classnames';
import renderFormField from '../FormFields';
import Field from '../FormFields/Field';
import useForm from '../../../utils/useForm';
import useCoreContext from '../../../core/Context/useCoreContext';
import './PhoneInput.scss';
import { PhoneInputSchema } from './types';

export function PhoneInput(props) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('ready');
    const showPrefix = !!props?.items?.length;
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<PhoneInputSchema>({
        schema: [...(showPrefix ? ['phonePrefix'] : []), 'phoneNumber'],
        defaultData: { ...(showPrefix ? { phonePrefix: props.selected } : {}) },
        rules: {
            phoneNumber: {
                modes: ['blur'],
                errorMessage: 'error.va.gen.01',
                validate: phone => phone?.length > 6
            }
        }
    });

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    this.showValidation = triggerValidation;
    this.setStatus = setStatus;
    return (
        <div className="adyen-checkout__phone-input">
            <Field
                errorMessage={!!errors.phoneNumber}
                label={i18n.get(props.phoneLabel)}
                className={classNames({
                    'adyen-checkout__input--phone-number': true
                })}
                inputWrapperModifiers={['phoneInput']}
                name={''}
            >
                <div className="adyen-checkout__input-wrapper">
                    <div
                        className={classNames({
                            'adyen-checkout__input': true,
                            'adyen-checkout__input--invalid': !!errors.phoneNumber
                        })}
                    >
                        {!!showPrefix && (
                            <Field inputWrapperModifiers={['phoneInput']} name={props.prefixName}>
                                {renderFormField('select', {
                                    className: 'adyen-checkout__dropdown--small adyen-checkout__countryFlag',
                                    filterable: false,
                                    items: props.items,
                                    name: props.prefixName,
                                    onChange: handleChangeFor('phonePrefix'),
                                    placeholder: i18n.get('infix'),
                                    selected: data.phonePrefix
                                })}

                                <div className="adyen-checkout__phoneNumber">
                                    <div>{data.phonePrefix}</div>

                                    <input
                                        type="tel"
                                        name={props.phoneName}
                                        value={data.phoneNumber}
                                        onInput={handleChangeFor('phoneNumber', 'input')}
                                        onBlur={handleChangeFor('phoneNumber', 'blur')}
                                        placeholder="123 456 789"
                                        className="adyen-checkout__input adyen-checkout__input--phoneNumber"
                                        autoCorrect="off"
                                    />
                                </div>
                            </Field>
                        )}
                    </div>
                </div>
            </Field>
            {this.props.showPayButton && this.props.payButton({ status })}
        </div>
    );
}

PhoneInput.defaultProps = {
    phoneLabel: 'telephoneNumber'
};

export default PhoneInput;
