import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import Field from '../../internal/FormFields/Field';
import ConsentCheckbox from '../../internal/FormFields/ConsentCheckbox';
import { bacsValidationRules, bacsFormatters } from './validate';
import { BacsDataState, BacsInputProps } from './types';
import './BacsInput.scss';

import useForm from '../../../utils/useForm';
import useImage from '../../../core/Context/useImage';
import InputText from '../../internal/FormFields/InputText';
import InputEmail from '../../internal/FormFields/InputEmail';
import FormInstruction from '../../internal/FormInstruction';
import { getErrorMessage } from '../../../utils/getErrorMessage';

const ENTER_STATE = 'enter-data';
const CONFIRM_STATE = 'confirm-data';

function BacsInput(props: BacsInputProps) {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<BacsDataState>({
        schema: ['holderName', 'bankAccountNumber', 'bankLocationId', 'shopperEmail', 'amountConsentCheckbox', 'accountConsentCheckbox'],
        defaultData: props.data,
        formatters: bacsFormatters,
        rules: bacsValidationRules
    });

    const [status, setStatus] = useState(ENTER_STATE);
    this.setStatus = setStatus;
    this.showValidation = triggerValidation;

    const handlePayButton = () => {
        if (!isValid) return this.showValidation();

        if (status === ENTER_STATE) {
            return this.setStatus(CONFIRM_STATE);
        } else if (status === CONFIRM_STATE) {
            return props.onSubmit();
        }
    };

    const handleEdit = () => {
        return this.setStatus(ENTER_STATE);
    };

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    return (
        <div
            className={classNames({
                'adyen-checkout__bacs': true,
                'adyen-checkout__bacs--confirm': status === CONFIRM_STATE || status === 'loading'
            })}
        >
            {props.showFormInstruction && <FormInstruction />}
            {status == CONFIRM_STATE && (
                <div
                    className={classNames({
                        'adyen-checkout__bacs--edit': true,
                        'adyen-checkout__bacs--edit-dropin': props.isDropin
                    })}
                >
                    <InputText
                        name={'bacsEdit'}
                        className={'adyen-checkout__bacs--edit-button'}
                        value={i18n.get('edit')}
                        aria-label={i18n.get('edit')}
                        readonly={true}
                        onClick={handleEdit}
                    />
                </div>
            )}

            <Field
                className={classNames({
                    'adyen-checkout__bacs--holder-name': true,
                    'adyen-checkout__field--inactive': status === CONFIRM_STATE || status === 'loading'
                })}
                label={i18n.get('bacs.accountHolderName')}
                errorMessage={errors.holderName ? i18n.get('bacs.accountHolderName.invalid') : false}
                isValid={valid.holderName}
                name={'accountHolderName'}
                i18n={i18n}
            >
                <InputText
                    name={'bacs.accountHolderName'}
                    className={'adyen-checkout__bacs-input--holder-name'}
                    placeholder={props.placeholders.holderName}
                    value={data.holderName}
                    aria-invalid={!valid.holderName}
                    aria-label={i18n.get('bacs.accountHolderName')}
                    aria-required={'true'}
                    required={true}
                    readonly={status === CONFIRM_STATE || status === 'loading'}
                    autocorrect={'off'}
                    onBlur={handleChangeFor('holderName', 'blur')}
                    onInput={handleChangeFor('holderName', 'input')}
                />
            </Field>

            <div className="adyen-checkout__bacs__num-id adyen-checkout__field-wrapper">
                <Field
                    errorMessage={!!errors.bankAccountNumber && i18n.get('bacs.accountNumber.invalid')}
                    label={i18n.get('bacs.accountNumber')}
                    className={classNames({
                        'adyen-checkout__bacs--bank-account-number': true,
                        'adyen-checkout__field--inactive': status === CONFIRM_STATE || status === 'loading'
                    })}
                    classNameModifiers={['col-70']}
                    isValid={valid.bankAccountNumber}
                    name={'bankAccountNumber'}
                    i18n={i18n}
                >
                    <InputText
                        value={data.bankAccountNumber}
                        className={'adyen-checkout__bacs-input--bank-account-number'}
                        placeholder={props.placeholders.bankAccountNumber}
                        aria-invalid={!valid.bankAccountNumber}
                        aria-label={i18n.get('bacs.accountNumber')}
                        aria-required={'true'}
                        required={true}
                        readonly={status === CONFIRM_STATE || status === 'loading'}
                        autocorrect={'off'}
                        onBlur={handleChangeFor('bankAccountNumber', 'blur')}
                        onInput={handleChangeFor('bankAccountNumber', 'input')}
                    />
                </Field>

                <Field
                    errorMessage={!!errors.bankLocationId && i18n.get('bacs.bankLocationId.invalid')}
                    label={i18n.get('bacs.bankLocationId')}
                    className={classNames({
                        'adyen-checkout__bacs--bank-location-id': true,
                        'adyen-checkout__field--inactive': status === CONFIRM_STATE || status === 'loading'
                    })}
                    classNameModifiers={['col-30']}
                    isValid={valid.bankLocationId}
                    name={'bankLocationId'}
                    i18n={i18n}
                >
                    <InputText
                        value={data.bankLocationId}
                        className={'adyen-checkout__bacs-input--bank-location-id'}
                        placeholder={props.placeholders.bankLocationId}
                        aria-invalid={!valid.bankLocationId}
                        aria-label={i18n.get('bacs.bankLocationId')}
                        aria-required={'true'}
                        required={true}
                        readonly={status === CONFIRM_STATE || status === 'loading'}
                        autocorrect={'off'}
                        onBlur={handleChangeFor('bankLocationId', 'blur')}
                        onInput={handleChangeFor('bankLocationId', 'input')}
                    />
                </Field>
            </div>

            <Field
                errorMessage={getErrorMessage(i18n, errors.shopperEmail, i18n.get('shopperEmail'))}
                label={i18n.get('shopperEmail')}
                className={classNames({
                    'adyen-checkout__bacs--shopper-email': true,
                    'adyen-checkout__field--inactive': status === CONFIRM_STATE || status === 'loading'
                })}
                isValid={valid.shopperEmail}
                name={'emailAddress'}
                i18n={i18n}
            >
                <InputEmail
                    value={data.shopperEmail}
                    name={'shopperEmail'}
                    className={'adyen-checkout__bacs-input--shopper-email'}
                    classNameModifiers={['large']}
                    placeholder={props.placeholders.shopperEmail}
                    spellcheck={false}
                    aria-invalid={!valid.shopperEmail}
                    aria-label={i18n.get('shopperEmail')}
                    aria-required={'true'}
                    required={true}
                    readonly={status === CONFIRM_STATE || status === 'loading'}
                    autocorrect={'off'}
                    onInput={handleChangeFor('shopperEmail', 'input')}
                    onBlur={handleChangeFor('shopperEmail', 'blur')}
                />
            </Field>

            {status === ENTER_STATE && (
                <ConsentCheckbox
                    classNameModifiers={['amountConsentCheckbox']}
                    errorMessage={!!errors.amountConsentCheckbox}
                    label={i18n.get('bacs.consent.amount')}
                    onChange={handleChangeFor('amountConsentCheckbox')}
                    checked={!!data.amountConsentCheckbox}
                    i18n={i18n}
                />
            )}

            {status === ENTER_STATE && (
                <ConsentCheckbox
                    classNameModifiers={['accountConsentCheckbox']}
                    errorMessage={!!errors.accountConsentCheckbox}
                    label={i18n.get('bacs.consent.account')}
                    onChange={handleChangeFor('accountConsentCheckbox')}
                    checked={!!data.accountConsentCheckbox}
                    i18n={i18n}
                />
            )}

            {props.showPayButton &&
                props.payButton({
                    status,
                    label:
                        status === ENTER_STATE
                            ? i18n.get('continue')
                            : `${i18n.get('bacs.confirm')} ${
                                  !!props.amount?.value && !!props.amount?.currency ? i18n.amount(props.amount.value, props.amount.currency) : ''
                              }`,
                    icon: getImage({ imageFolder: 'components/' })('lock'),
                    onClick: handlePayButton
                })}
        </div>
    );
}

BacsInput.defaultProps = {
    data: {},
    placeholders: {}
};

export default BacsInput;
