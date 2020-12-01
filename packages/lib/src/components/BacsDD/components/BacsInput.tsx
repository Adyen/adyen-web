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

    const [data, setData] = useState<BacsDataState>(props.data);
    const [errors, setErrors] = useState<BacsErrorsState>({});
    const [valid, setValid] = useState<BacsValidState>({
        ...(props.data.holderName && {
            holderName: validator.validate('holderName', 'input')(props.data.holderName).isValid
        }),
        ...(props.data.bankAccountNumber && {
            bankAccountNumber: validator.validate('bankAccountNumber', 'input')(props.data.bankAccountNumber).isValid
        }),
        ...(props.data.bankLocationId && {
            bankLocationId: validator.validate('bankLocationId', 'input')(props.data.bankLocationId).isValid
        }),
        ...(props.data.shopperEmail && {
            shopperEmail: validator.validate('shopperEmail', 'input')(props.data.shopperEmail).isValid
        })
    });

    const [status, setStatus] = useState(props['compState']);

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    this.setStatus(props['compState']);

    console.log('### BacsInput::BacsInput:: status', status);

    this.showValidation = (): void => {
        setErrors({
            holderName: !validator.validate('holderName', 'blur')(data.holderName).isValid,
            bankAccountNumber: !validator.validate('bankAccountNumber', 'blur')(data.bankAccountNumber).isValid,
            bankLocationId: !validator.validate('bankLocationId', 'blur')(data.bankLocationId).isValid,
            shopperEmail: !validator.validate('shopperEmail', 'blur')(data.shopperEmail).isValid,
            amountConsentCheckbox: !data.amountConsentCheckbox,
            accountConsentCheckbox: !data.accountConsentCheckbox
        });
    };

    const handleEventFor = (key: string, mode: string) => (e: Event): void => {
        const val: string = (e.target as HTMLInputElement).value;
        const { value, isValid, showError }: ValidationObject = validator.validate(key, mode)(val);

        setData({ ...data, [key]: value });
        setErrors({ ...errors, [key]: !isValid && showError });
        setValid({ ...valid, [key]: isValid });
    };

    const handleConsentCheckbox = (key: string) => (e): void => {
        const { checked } = e.target;

        const consentKey = key + 'ConsentCheckbox';

        setData(prevData => ({ ...prevData, [consentKey]: checked }));
        setValid(prevValid => ({ ...prevValid, [consentKey]: checked }));
        setErrors(prevErrors => ({ ...prevErrors, [consentKey]: !checked }));
    };

    useEffect(() => {
        props.onChange({
            data,
            isValid:
                valid.holderName &&
                valid.bankAccountNumber &&
                valid.bankLocationId &&
                valid.shopperEmail &&
                !!valid.amountConsentCheckbox &&
                !!valid.accountConsentCheckbox
        });
    }, [data, valid]);

    return (
        <div className="adyen-checkout__bacs">
            <Field
                className={classNames({
                    'adyen-checkout__bacs--holder-name': true,
                    'adyen-checkout__field--inactive': status === 'confirm-data'
                })}
                label={i18n.get('bacs.holderName')}
                errorMessage={errors.holderName ? i18n.get('bacs.holderName.invalid') : false}
                isValid={valid.holderName}
            >
                {renderFormField('text', {
                    name: 'bacs.holderName',
                    className: 'adyen-checkout__bacs-input--holder-name',
                    placeholder: props.placeholders.holderName,
                    value: data.holderName,
                    'aria-invalid': !valid.holderName,
                    'aria-label': i18n.get('bacs.holderName'),
                    'aria-required': 'true',
                    required: true,
                    readonly: status === 'confirm-data',
                    autocorrect: 'off',
                    onChange: handleEventFor('holderName', 'blur'),
                    onInput: handleEventFor('holderName', 'input')
                })}
            </Field>
            <Field
                errorMessage={!!errors.bankAccountNumber && i18n.get('bacs.bankAccountNumber.invalid')}
                label={i18n.get('bacs.bankAccountNumber')}
                className={classNames({
                    'adyen-checkout__bacs--bank-account-number': true,
                    'adyen-checkout__field--inactive': status === 'confirm-data'
                })}
                isValid={valid.bankAccountNumber}
            >
                {renderFormField('text', {
                    value: data.bankAccountNumber,
                    className: 'adyen-checkout__bacs-input--bank-account-number',
                    placeholder: props.placeholders.bankAccountNumber,
                    'aria-invalid': !valid.bankAccountNumber,
                    'aria-label': i18n.get('bacs.bankAccountNumber'),
                    'aria-required': 'true',
                    required: true,
                    readonly: status === 'confirm-data',
                    autocorrect: 'off',
                    onChange: handleEventFor('bankAccountNumber', 'blur'),
                    onInput: handleEventFor('bankAccountNumber', 'input')
                })}
            </Field>
            <Field
                errorMessage={!!errors.bankLocationId && i18n.get('bacs.bankLocationId.invalid')}
                label={i18n.get('bacs.bankLocationId')}
                className={classNames({
                    'adyen-checkout__bacs--bank-location-id': true,
                    'adyen-checkout__field--inactive': status === 'confirm-data'
                })}
                isValid={valid.bankLocationId}
            >
                {renderFormField('text', {
                    value: data.bankLocationId,
                    className: 'adyen-checkout__bacs-input--bank-location-id',
                    placeholder: props.placeholders.bankLocationId,
                    'aria-invalid': !valid.bankLocationId,
                    'aria-label': i18n.get('bacs.bankLocationId'),
                    'aria-required': 'true',
                    required: true,
                    readonly: status === 'confirm-data',
                    autocorrect: 'off',
                    onChange: handleEventFor('bankLocationId', 'blur'),
                    onInput: handleEventFor('bankLocationId', 'input')
                })}
            </Field>
            <Field
                errorMessage={!!errors.shopperEmail && i18n.get('bacs.shopperEmail.invalid')}
                label={i18n.get('bacs.shopperEmail')}
                className={classNames({
                    'adyen-checkout__bacs--shopper-email': true,
                    'adyen-checkout__field--inactive': status === 'confirm-data'
                })}
                isValid={valid.shopperEmail}
            >
                {renderFormField('emailAddress', {
                    value: data.shopperEmail,
                    name: 'shopperEmail',
                    className: 'adyen-checkout__bacs-input--shopper-email',
                    classNameModifiers: ['large'],
                    placeholder: props.placeholders.shopperEmail,
                    spellcheck: false,
                    'aria-invalid': !valid.shopperEmail,
                    'aria-label': i18n.get('bacs.shopperEmail'),
                    'aria-required': 'true',
                    required: true,
                    readonly: status === 'confirm-data',
                    autocorrect: 'off',
                    onInput: handleEventFor('shopperEmail', 'input'),
                    onChange: handleEventFor('shopperEmail', 'blur')
                })}
            </Field>
            {status !== 'confirm-data' && (
                <ConsentCheckbox
                    data={data}
                    errorMessage={!!errors.amountConsentCheckbox}
                    label={i18n.get('bacs.consent.amount')}
                    onChange={handleConsentCheckbox('amount')}
                />
            )}
            {status !== 'confirm-data' && (
                <ConsentCheckbox
                    data={data}
                    errorMessage={!!errors.accountConsentCheckbox}
                    label={i18n.get('bacs.consent.account')}
                    onChange={handleConsentCheckbox('account')}
                />
            )}
            {props.showPayButton &&
                props.payButton({ status, label: status !== 'confirm-data' ? i18n.get('continue') : i18n.get('confirmPurchase') })}
        </div>
    );
}

BacsInput.defaultProps = {
    data: {},
    placeholders: {}
    // onChange: () => {}
};

export default BacsInput;
