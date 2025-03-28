import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import FormInstruction from '../../internal/FormInstruction';
import { AccountTypeSelector } from './AccountTypeSelector';
import Fieldset from '../../internal/FormFields/Fieldset';
import useForm from '../../../utils/useForm';
import { useEffect, useRef, useState } from 'preact/hooks';
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

    const achRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: triggerValidation
    });

    useEffect(() => {
        setComponentRef(achRef.current);
    }, [setComponentRef, achRef.current]);

    useEffect(() => {
        onChange({ data, valid, errors, isValid });
    }, [onChange, data, valid, errors, isValid]);

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
                        isValid={!!valid.ownerName}
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
                    name={'accountNumber'}
                >
                    <InputText
                        name={'accountNumber'}
                        placeholder={placeholders?.accountNumber}
                        value={data.accountNumber}
                        onInput={handleChangeFor('accountNumber', 'input')}
                        onBlur={handleChangeFor('accountNumber', 'blur')}
                        required={true}
                    />
                </Field>

                {/*<Field*/}
                {/*    label={i18n.get('Verify account number')}*/}
                {/*    // classNameModifiers={['col-60', 'holderName']}*/}
                {/*    errorMessage={!!errors.routingNumber && i18n.get('ach.accountHolderNameField.invalid')}*/}
                {/*    // showContextualElement={showContextualElement}*/}
                {/*    // contextualText={i18n.get('ach.accountHolderNameField.contextualText')}*/}
                {/*    // dir={'ltr'}*/}
                {/*    name={'accountNumberVerification'}*/}
                {/*    // i18n={i18n}*/}
                {/*>*/}
                {/*    <InputText*/}
                {/*        name={'accountNumberVerification'}*/}
                {/*        placeholder={placeholders?.accountNumberVerification}*/}
                {/*        value={data.accountNumberVerification}*/}
                {/*        onInput={handleChangeFor('accountNumberVerification', 'input')}*/}
                {/*        onBlur={handleChangeFor('accountNumberVerification', 'blur')}*/}
                {/*        // required={holderNameRequired}*/}
                {/*    />*/}
                {/*</Field>*/}
            </Fieldset>

            {showPayButton && payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}

export default AchComponent;
