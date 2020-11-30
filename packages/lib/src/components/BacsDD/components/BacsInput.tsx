import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import Field from '../../internal/FormFields/Field';
import { renderFormField } from '../../internal/FormFields';
import ConsentCheckbox from '../../internal/FormFields/ConsentCheckbox';
import { bacsValidationRules } from './validate';
import Validator from '../../../utils/Validator';
import { BacsDataState, BacsErrorsState, BacsInputProps, BacsValidState, ValidationObject } from './types';
import './BacsInput.scss';

function BacsInput(props: BacsInputProps) {
    const { i18n } = useCoreContext();
    const validator: Validator = new Validator(bacsValidationRules);

    console.log('### BacsInput::BacsInput:: props=', props);

    const [data, setData] = useState<BacsDataState>(props.data);
    const [errors, setErrors] = useState<BacsErrorsState>({});
    const [valid, setValid] = useState<BacsValidState>({
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
        const { value, isValid, showError }: ValidationObject = validator.validate(key, mode)(val);

        setData({ ...data, [key]: value });
        setErrors({ ...errors, [key]: !isValid && showError });
        setValid({ ...valid, [key]: isValid });
    };

    // const handleConsentCheckbox = e => {
    //     const { checked } = e.target;
    //     setData(prevData => ({ ...prevData, consentCheckbox: checked }));
    //     setValid(prevValid => ({ ...prevValid, consentCheckbox: checked }));
    //     setErrors(prevErrors => ({ ...prevErrors, consentCheckbox: !checked }));
    // };
    const handleConsentCheckbox = (key: string) => (e): void => {
        const { checked } = e.target;

        const consentKey = key + 'ConsentCheckbox';

        setData(prevData => ({ ...prevData, [consentKey]: checked }));
        setValid(prevValid => ({ ...prevValid, [consentKey]: checked }));
        setErrors(prevErrors => ({ ...prevErrors, [consentKey]: !checked }));
    };

    useEffect(() => {
        props.onChange({ data, isValid: valid.telephoneNumber });
    }, [data, valid]);

    return (
        <div className="adyen-checkout__mb-way">
            <Field
                className={'adyen-checkout__field--owner-name'}
                label={i18n.get('bacs.holderName')}
                errorMessage={errors.holderName ? i18n.get('bacs.holderName.invalid') : false}
            >
                {renderFormField('text', {
                    name: 'bacs.holderName',
                    className: 'adyen-checkout__iban-input__owner-name',
                    placeholder: props.placeholders.holderName,
                    value: data.holderName,
                    // 'aria-invalid': !!this.state.errors.holder,
                    // 'aria-label': i18n.get('sepa.ownerName'),
                    onChange: handleEventFor('holderName', 'blur'),
                    onInput: handleEventFor('holderName', 'input')
                })}
            </Field>

            <Field
                errorMessage={!!errors.telephoneNumber && i18n.get('bacs.accountNumberField.invalid')}
                label={i18n.get('bacs.bankAccount')}
                className={classNames('adyen-checkout__input--phone-number')}
                isValid={valid.telephoneNumber}
            >
                {renderFormField('text', {
                    value: data.telephoneNumber,
                    className: 'adyen-checkout__pm__phoneNumber__input',
                    placeholder: props.placeholders.telephoneNumber,
                    required: true,
                    autoCorrect: 'off',
                    onChange: handleEventFor('telephoneNumber', 'blur'),
                    onInput: handleEventFor('telephoneNumber', 'input')
                })}
            </Field>

            <Field
                errorMessage={!!errors.shopperEmail && i18n.get('bacs.shopperEmail.invalid')}
                label={i18n.get('bacs.shopperEmail')}
                classNameModifiers={['shopperEmail']}
                isValid={valid.shopperEmail}
            >
                {renderFormField('emailAddress', {
                    value: data.shopperEmail,
                    name: 'shopperEmail',
                    classNameModifiers: ['large'],
                    placeholder: props.placeholders.shopperEmail,
                    spellcheck: false,
                    required: true,
                    autocorrect: 'off',
                    onInput: handleEventFor('shopperEmail', 'input'),
                    onChange: handleEventFor('shopperEmail', 'blur')
                })}
            </Field>

            <ConsentCheckbox
                data={data}
                errorMessage={!!errors.amountConsentCheckbox}
                label={i18n.get('bacsdd.consent.amount')}
                onChange={handleConsentCheckbox('amount')}
            />

            <ConsentCheckbox
                data={data}
                errorMessage={!!errors.accountConsentCheckbox}
                label={i18n.get('bacsdd.consent.account')}
                onChange={handleConsentCheckbox('account')}
            />

            {props.showPayButton && props.payButton({ status, label: i18n.get('continue') })}
        </div>
    );
}

BacsInput.defaultProps = {
    data: {},
    placeholders: {}
    // onChange: () => {}
};

export default BacsInput;
