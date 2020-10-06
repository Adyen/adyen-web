import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import useCoreContext from '../../../../core/Context/useCoreContext';
import Field from '../../../internal/FormFields/Field';
import { renderFormField } from '../../../internal/FormFields';
import { mbwayValidationRules } from './validate';
import Validator from '../../../../utils/Validator';
import { MBWayDataState, MBWayErrorsState, MBWayInputProps, MBWayValidState, ValidationObject } from './types';
import './MBWayInput.scss';

function MBWayInput(props: MBWayInputProps) {
    const { i18n } = useCoreContext();
    const validator: Validator = new Validator(mbwayValidationRules);

    const [data, setData] = useState<MBWayDataState>(props.data);
    const [errors, setErrors] = useState<MBWayErrorsState>({});
    const [valid, setValid] = useState<MBWayValidState>({
        ...(props.data.telephoneNumber && { telephoneNumber: validator.validate('telephoneNumber', 'input')(props.data.telephoneNumber).isValid })
    });

    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    this.showValidation = (): void => {
        const hasError = !validator.validate('telephoneNumber', 'input')(props.data.telephoneNumber).isValid;
        setErrors({ ...errors, telephoneNumber: hasError });
    };

    const handleEventFor = (key: string, mode: string) => (e: Event): void => {
        const val: string = (e.target as HTMLInputElement).value;
        const { value, isValid, showError }: ValidationObject = validator.validate('telephoneNumber', mode)(val);

        setData({ ...data, telephoneNumber: value });
        setErrors({ ...errors, telephoneNumber: !isValid && showError });
        setValid({ ...valid, telephoneNumber: isValid });
    };

    useEffect(() => {
        props.onChange({ data, isValid: valid.telephoneNumber });
    }, [data, valid]);

    return (
        <div className="adyen-checkout__mb-way">
            <Field
                errorMessage={!!errors.telephoneNumber && i18n.get('telephoneNumber.invalid')}
                label={i18n.get('telephoneNumber')}
                className={classNames('adyen-checkout__input--phone-number')}
                isValid={valid.telephoneNumber}
            >
                {renderFormField('tel', {
                    value: data.telephoneNumber,
                    className: 'adyen-checkout__pm__phoneNumber__input',
                    placeholder: props.placeholders.telephoneNumber,
                    required: true,
                    autoCorrect: 'off',
                    onChange: handleEventFor('telephoneNumber', 'blur'),
                    onInput: handleEventFor('telephoneNumber', 'input')
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
