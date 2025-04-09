import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import FormInstruction from '../../internal/FormInstruction';
import { AccountTypeSelector } from './AccountTypeSelector';
import Fieldset from '../../internal/FormFields/Fieldset';
import useForm from '../../../utils/useForm';
import Field from '../../internal/FormFields/Field';
import InputText from '../../internal/FormFields/InputText';
import { achValidationRules, achFormatters } from './validate';
import StoreDetails from '../../internal/StoreDetails';

import type { PayButtonProps } from '../../internal/PayButton/PayButton';
import type { ComponentMethodsRef } from '../../internal/UIElement/types';
import type { AchPlaceholders } from '../types';

type AchForm = {
    selectedAccountType: string;
    ownerName: string;
    routingNumber: string;
    accountNumber: string;
    accountNumberVerification: string;
};

interface AchComponentProps {
    onChange({
        data,
        valid,
        errors,
        isValid,
        storePaymentMethod
    }: {
        data: AchForm;
        valid: { [key: string]: boolean };
        errors: { [key: string]: any };
        isValid: boolean;
        storePaymentMethod: boolean;
    }): void;
    payButton: (props: Partial<PayButtonProps>) => h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    hasHolderName: boolean;
    showPayButton: boolean;
    enableStoreDetails: boolean;
    placeholders?: AchPlaceholders;
}

function AchComponent({ onChange, payButton, showPayButton, placeholders, hasHolderName, setComponentRef, enableStoreDetails }: AchComponentProps) {
    const schema = useMemo(
        () => ['selectedAccountType', 'routingNumber', 'accountNumber', 'accountNumberVerification', ...(hasHolderName ? ['ownerName'] : [])],
        [hasHolderName]
    );
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('ready');
    const { handleChangeFor, triggerValidation, data, errors, valid, isValid } = useForm<AchForm>({
        schema,
        rules: achValidationRules,
        formatters: achFormatters
    });
    const [storePaymentMethod, setStorePaymentMethod] = useState(false);
    const isFormDisabled = status === 'loading';

    const achRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: triggerValidation
    });

    useEffect(() => {
        setComponentRef(achRef.current);
    }, [setComponentRef, achRef.current]);

    useEffect(() => {
        onChange({ data, valid, errors, isValid, storePaymentMethod });
    }, [onChange, data, valid, errors, isValid, storePaymentMethod]);

    /**
     * If the "Verify account number" field has errors, we want to trigger
     * its validation when there is any change done to the "Account number" field
     */
    const onAccountNumberInput = useCallback(
        (event: h.JSX.TargetedInputEvent<HTMLInputElement>) => {
            handleChangeFor('accountNumber', 'input')(event);

            const hasAccountVerificationError = !!errors.accountNumberVerification;
            if (hasAccountVerificationError) {
                triggerValidation(['accountNumberVerification']);
            }
        },
        [handleChangeFor, triggerValidation, data.accountNumberVerification, errors.accountNumberVerification]
    );

    return (
        <div className="adyen-checkout__ach">
            <FormInstruction />

            <Fieldset classNameModifiers={[]} label={i18n.get('ach.bankAccount.title')}>
                <AccountTypeSelector
                    placeholder={placeholders?.accountTypeSelector}
                    onSelect={handleChangeFor('selectedAccountType')}
                    selectedAccountType={data.selectedAccountType}
                    disabled={isFormDisabled}
                    errorMessage={!!errors.selectedAccountType && i18n.get(errors.selectedAccountType.errorMessage)}
                />

                {hasHolderName && (
                    <Field
                        label={i18n.get('ach.accountHolderNameField.title')}
                        errorMessage={!!errors.ownerName && i18n.get(errors.ownerName.errorMessage)}
                        isValid={!!valid.ownerName}
                        name={'ownerName'}
                    >
                        <InputText
                            disabled={isFormDisabled}
                            name={'ownerName'}
                            placeholder={placeholders?.ownerName}
                            value={data.ownerName}
                            onInput={handleChangeFor('ownerName', 'input')}
                            onBlur={handleChangeFor('ownerName', 'blur')}
                            required={true}
                        />
                    </Field>
                )}

                <Field
                    label={i18n.get('ach.routingNumber.label')}
                    classNameModifiers={['col-60']}
                    errorMessage={!!errors.routingNumber && i18n.get(errors.routingNumber.errorMessage)}
                    name={'routingNumber'}
                    isValid={!!valid.routingNumber}
                >
                    <InputText
                        disabled={isFormDisabled}
                        name={'routingNumber'}
                        placeholder={placeholders?.routingNumber}
                        value={data.routingNumber}
                        onInput={handleChangeFor('routingNumber', 'input')}
                        onBlur={handleChangeFor('routingNumber', 'blur')}
                        required={true}
                        maxlength={9}
                    />
                </Field>

                <Field
                    label={i18n.get('ach.bankAccountNumber.label')}
                    classNameModifiers={['col-40']}
                    errorMessage={!!errors.accountNumber && i18n.get(errors.accountNumber.errorMessage)}
                    isValid={!!valid.accountNumber}
                    name={'accountNumber'}
                >
                    <InputText
                        disabled={isFormDisabled}
                        name={'accountNumber'}
                        placeholder={placeholders?.accountNumber}
                        value={data.accountNumber}
                        onInput={onAccountNumberInput}
                        onBlur={handleChangeFor('accountNumber', 'blur')}
                        required={true}
                        maxlength={17}
                    />
                </Field>

                <Field
                    label={i18n.get('ach.bankAccountNumberVerification.label')}
                    errorMessage={!!errors.accountNumberVerification && i18n.get(errors.accountNumberVerification.errorMessage)}
                    name={'accountNumberVerification'}
                    isValid={!!valid.accountNumberVerification}
                >
                    <InputText
                        disabled={isFormDisabled}
                        name={'accountNumberVerification'}
                        placeholder={placeholders?.accountNumberVerification}
                        value={data.accountNumberVerification}
                        onInput={handleChangeFor('accountNumberVerification', 'input')}
                        onBlur={handleChangeFor('accountNumberVerification', 'blur')}
                        required={true}
                        maxlength={17}
                    />
                </Field>
            </Fieldset>

            {enableStoreDetails && <StoreDetails disabled={isFormDisabled} onChange={setStorePaymentMethod} />}

            {showPayButton && payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}

export default AchComponent;
