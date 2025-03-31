import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import FormInstruction from '../../internal/FormInstruction';
import { AccountTypeSelector } from './AccountTypeSelector';
import Fieldset from '../../internal/FormFields/Fieldset';
import useForm from '../../../utils/useForm';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { PayButtonProps } from '../../internal/PayButton/PayButton';
import Field from '../../internal/FormFields/Field';
import InputText from '../../internal/FormFields/InputText';
import { ComponentMethodsRef } from '../../internal/UIElement/types';
import { achValidationRules } from './validate';

interface AchComponentProps {
    onChange(e): void; //TODO
    showPayButton: boolean;
    payButton: (props: Partial<PayButtonProps>) => h.JSX.Element;
    placeholders: any; // TODO
    hasHolderName: boolean;
    holderNameRequired: boolean;
    showContextualElement: boolean;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

type AchForm = {
    selectedAccountType: string;
    ownerName: string;
    routingNumber: string;
    accountNumber: string;
    accountNumberVerification: string;
};

function AchComponent({ onChange, payButton, showPayButton, placeholders, hasHolderName, holderNameRequired, setComponentRef }: AchComponentProps) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('ready');
    const { handleChangeFor, triggerValidation, data, errors, valid, isValid } = useForm<AchForm>({
        schema: ['selectedAccountType', 'ownerName', 'routingNumber', 'accountNumber', 'accountNumberVerification'],
        rules: achValidationRules
    });
    const [hasFormBeenValidated, setHasFormBeenValidated] = useState<boolean>(false);

    /**
     * Callback needed in order to flag when the full form is validated, so we can properly handle
     * the "Verify Account Number" field validation
     */
    const validateForm = useCallback(
        (scheme: string[]) => {
            setHasFormBeenValidated(true);
            triggerValidation(scheme);
        },
        [triggerValidation]
    );

    const achRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: validateForm
    });

    useEffect(() => {
        setComponentRef(achRef.current);
    }, [setComponentRef, achRef.current]);

    useEffect(() => {
        onChange({ data, valid, errors, isValid });
    }, [onChange, data, valid, errors, isValid]);

    /**
     * When the "Account Number" loses focus, we apply validation on the "Verify account number" field
     * if the full form has been ever validated
     */
    const onAccountNumberBlur = useCallback(
        (event: h.JSX.TargetedFocusEvent<HTMLInputElement>) => {
            handleChangeFor('accountNumber', 'blur')(event);
            if (hasFormBeenValidated) {
                triggerValidation(['accountNumberVerification']);
            }
        },
        [handleChangeFor, triggerValidation, hasFormBeenValidated]
    );

    return (
        <div className="adyen-checkout__ach">
            <FormInstruction />

            <Fieldset classNameModifiers={[]} label={i18n.get('ach.bankAccount.title')}>
                <AccountTypeSelector
                    onSelect={handleChangeFor('selectedAccountType')}
                    selectedAccountType={data.selectedAccountType}
                    errorMessage={!!errors.selectedAccountType && i18n.get(errors.selectedAccountType.errorMessage)}
                />

                {hasHolderName && (
                    <Field
                        label={i18n.get('ach.accountHolderNameField.title')}
                        errorMessage={!!errors.ownerName && i18n.get(errors.ownerName.errorMessage)}
                        isValid={!!valid.ownerName} // TOOD: is it needed?
                        name={'ownerName'}
                    >
                        <InputText
                            name={'ownerName'}
                            placeholder={placeholders?.ownerName}
                            value={data.ownerName}
                            onInput={handleChangeFor('ownerName', 'input')}
                            onBlur={handleChangeFor('ownerName', 'blur')}
                            required={holderNameRequired}
                        />
                    </Field>
                )}

                <Field
                    label={i18n.get('ach.routingNumber.label')}
                    classNameModifiers={['col-60']}
                    errorMessage={!!errors.routingNumber && i18n.get(errors.routingNumber.errorMessage)}
                    name={'routingNumber'}
                    isValid={!!valid.routingNumber} // TOOD: is it needed?
                >
                    <InputText
                        name={'routingNumber'}
                        placeholder={placeholders?.routingNumber}
                        value={data.routingNumber}
                        onInput={handleChangeFor('routingNumber', 'input')}
                        onBlur={handleChangeFor('routingNumber', 'blur')}
                        required={true}
                    />
                </Field>

                <Field
                    label={i18n.get('ach.bankAccountNumber.label')}
                    classNameModifiers={['col-40']}
                    errorMessage={!!errors.accountNumber && i18n.get(errors.accountNumber.errorMessage)}
                    isValid={!!valid.accountNumber} // TOOD: is it needed?
                    name={'accountNumber'}
                >
                    <InputText
                        name={'accountNumber'}
                        placeholder={placeholders?.accountNumber}
                        value={data.accountNumber}
                        onInput={handleChangeFor('accountNumber', 'input')}
                        onBlur={onAccountNumberBlur}
                        required={true}
                    />
                </Field>

                <Field
                    label={i18n.get('ach.bankAccountNumberVerification.label')}
                    errorMessage={!!errors.accountNumberVerification && i18n.get(errors.accountNumberVerification.errorMessage)}
                    name={'accountNumberVerification'}
                >
                    <InputText
                        name={'accountNumberVerification'}
                        placeholder={placeholders?.accountNumberVerification}
                        value={data.accountNumberVerification}
                        onInput={handleChangeFor('accountNumberVerification', 'input')}
                        onBlur={handleChangeFor('accountNumberVerification', 'blur')}
                        required={true}
                    />
                </Field>
            </Fieldset>

            {showPayButton && payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}

export default AchComponent;
