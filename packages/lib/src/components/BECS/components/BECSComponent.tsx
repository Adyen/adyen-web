import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { useCoreContext } from '../../../core/Context/CoreProvider';
import useForm from '../../../utils/useForm';
import Field from '../../internal/FormFields/Field';
import InputEmail from '../../internal/FormFields/InputEmail';
import InputText from '../../internal/FormFields/InputText';
import FormInstruction from '../../internal/FormInstruction';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { becsFormatters, becsValidationRules } from './validate';

import type { ComponentMethodsRef } from '../../internal/UIElement/types';
import type { PayButtonProps } from '../../internal/PayButton/PayButton';
import type { FormStateErrors, FormStateValid } from '../../../utils/useForm/types';
import type { BECSFormData } from '../types';

import styles from '../BECS.module.scss';

interface BECSComponentProps {
    data?: BECSFormData;
    onChange(state: { data: BECSFormData; valid: FormStateValid; errors: FormStateErrors; isValid?: boolean }): void;
    payButton: (props: PayButtonProps) => h.JSX.Element;
    placeholders?: BECSFormData;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    showPayButton?: boolean;
}

export function BECSComponent({
    data: defaultData,
    onChange,
    payButton,
    placeholders,
    setComponentRef,
    showPayButton
}: Readonly<BECSComponentProps>) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('ready');
    const { data, errors, handleChangeFor, isValid, triggerValidation, valid } = useForm<BECSFormData>({
        schema: ['holderName', 'bankBranchCode', 'bankAccountNumber', 'shopperEmail'],
        defaultData,
        formatters: becsFormatters,
        rules: becsValidationRules
    });
    const componentRef = useRef<ComponentMethodsRef>({ setStatus, showValidation: triggerValidation });
    const isDisabled = status === 'loading';

    useEffect(() => {
        setComponentRef(componentRef.current);
    }, [setComponentRef]);

    useEffect(() => {
        onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid, onChange]);

    return (
        <div>
            <FormInstruction />

            <Field
                label={i18n.get('becs.accountHolderName')}
                errorMessage={errors.holderName ? i18n.get('becs.accountHolderName.invalid') : false}
                isValid={valid.holderName}
                name="holderName"
                i18n={i18n}
            >
                <InputText
                    disabled={isDisabled}
                    name="holderName"
                    placeholder={placeholders?.holderName}
                    value={data.holderName}
                    onInput={handleChangeFor('holderName', 'input')}
                    onBlur={handleChangeFor('holderName', 'blur')}
                    required
                    autocomplete="name"
                />
            </Field>

            <div className={styles.bankDetails}>
                <Field
                    label={i18n.get('becs.bsb')}
                    errorMessage={errors.bankBranchCode ? i18n.get('becs.bsb.invalid') : false}
                    isValid={valid.bankBranchCode}
                    name="bankBranchCode"
                    contextualText={i18n.get('becs.bsb.contextualText')}
                    i18n={i18n}
                >
                    <InputText
                        disabled={isDisabled}
                        name="bankBranchCode"
                        placeholder={placeholders?.bankBranchCode}
                        value={data.bankBranchCode}
                        onInput={handleChangeFor('bankBranchCode', 'input')}
                        onBlur={handleChangeFor('bankBranchCode', 'blur')}
                        required
                        maxlength={7}
                        inputmode="numeric"
                        autocomplete={undefined}
                    />
                </Field>

                <Field
                    label={i18n.get('becs.accountNumber')}
                    errorMessage={errors.bankAccountNumber ? i18n.get('becs.accountNumber.invalid') : false}
                    isValid={valid.bankAccountNumber}
                    name="bankAccountNumber"
                    i18n={i18n}
                >
                    <InputText
                        disabled={isDisabled}
                        name="bankAccountNumber"
                        placeholder={placeholders?.bankAccountNumber}
                        value={data.bankAccountNumber}
                        onInput={handleChangeFor('bankAccountNumber', 'input')}
                        onBlur={handleChangeFor('bankAccountNumber', 'blur')}
                        required
                        inputmode="numeric"
                        autocomplete={undefined}
                    />
                </Field>
            </div>

            <Field
                label={i18n.get('shopperEmail')}
                errorMessage={getErrorMessage(i18n, errors.shopperEmail ?? undefined, i18n.get('shopperEmail'))}
                isValid={valid.shopperEmail}
                name="shopperEmail"
                contextualText={i18n.get('becs.shopperEmail.contextualText')}
                i18n={i18n}
            >
                <InputEmail
                    disabled={isDisabled}
                    name="shopperEmail"
                    placeholder={placeholders?.shopperEmail}
                    value={data.shopperEmail}
                    onInput={handleChangeFor('shopperEmail', 'input')}
                    onBlur={handleChangeFor('shopperEmail', 'blur')}
                    required
                    autocomplete="email"
                />
            </Field>

            <p className={styles.mandate}>{i18n.get('becs.mandate')}</p>

            {showPayButton && payButton({ status, label: i18n.get('becs.confirm') })}
        </div>
    );
}
