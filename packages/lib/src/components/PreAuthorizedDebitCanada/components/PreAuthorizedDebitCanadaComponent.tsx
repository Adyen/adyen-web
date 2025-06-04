import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import Fieldset from '../../internal/FormFields/Fieldset';
import FormInstruction from '../../internal/FormInstruction';
import useForm from '../../../utils/useForm';
import Field from '../../internal/FormFields/Field';
import InputText from '../../internal/FormFields/InputText';
import { preAuthorizedDebitCanadaFormatters, preAuthorizedDebitCanadaValidationRules } from './validate';
import StoreDetails from '../../internal/StoreDetails';
import useImage from '../../../core/Context/useImage';
import { SettlementInfo } from './SettlementInfo';

import type { PayButtonProps } from '../../internal/PayButton/PayButton';
import type { ComponentMethodsRef } from '../../internal/UIElement/types';
import type { PreAuthorizedDebitCanadaPlaceholders } from '../types';

import './PreAuthorizedDebitCanada.scss';

interface PreAuthorizedDebitCanadaForm {
    ownerName: string;
    bankAccountNumber: string;
    bankCode: string;
    bankLocationId: string;
}

interface PreAuthorizedDebitCanadaComponentProps {
    onChange({
        data,
        valid,
        errors,
        isValid,
        storePaymentMethod
    }: {
        data: PreAuthorizedDebitCanadaForm;
        valid: { [key: string]: boolean };
        errors: { [key: string]: any };
        isValid: boolean;
        storePaymentMethod: boolean;
    }): void;
    payButton: (props: Partial<PayButtonProps>) => h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    showPayButton: boolean;
    enableStoreDetails: boolean;
    showContextualElement?: boolean;
    placeholders?: PreAuthorizedDebitCanadaPlaceholders;
}

function PreAuthorizedDebitCanadaComponent({
    onChange,
    payButton,
    showPayButton,
    placeholders,
    setComponentRef,
    enableStoreDetails,
    showContextualElement = true
}: Readonly<PreAuthorizedDebitCanadaComponentProps>) {
    const getImage = useImage();
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('ready');
    const { handleChangeFor, triggerValidation, data, errors, valid, isValid } = useForm<PreAuthorizedDebitCanadaForm>({
        schema: ['ownerName', 'bankAccountNumber', 'bankCode', 'bankLocationId'],
        rules: preAuthorizedDebitCanadaValidationRules,
        formatters: preAuthorizedDebitCanadaFormatters
    });
    const [storePaymentMethod, setStorePaymentMethod] = useState(false);

    const isFormDisabled = status === 'loading';

    const achRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: () => {
            triggerValidation();
        }
    });

    useEffect(() => {
        setComponentRef(achRef.current);
    }, [setComponentRef, achRef.current]);

    useEffect(() => {
        onChange({ data, valid, errors, isValid, storePaymentMethod });
    }, [onChange, data, valid, errors, isValid, storePaymentMethod]);

    return (
        <div className="adyen-checkout__eftpad-canada">
            <FormInstruction />

            <Fieldset classNameModifiers={[]}>
                <Field
                    label={i18n.get('eftpad-canada.input.accountHolderName.label')}
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

                <Field
                    label={i18n.get('eftpad-canada.input.accountNumber.label')}
                    errorMessage={!!errors.bankAccountNumber && i18n.get(errors.bankAccountNumber.errorMessage)}
                    name={'bankAccountNumber'}
                    isValid={!!valid.bankAccountNumber}
                    showContextualElement={showContextualElement}
                    contextualText={i18n.get('eftpad-canada.input.accountNumber.contextualText')}
                >
                    <InputText
                        disabled={isFormDisabled}
                        name={'bankAccountNumber'}
                        placeholder={placeholders?.bankAccountNumber}
                        value={data.bankAccountNumber}
                        onInput={handleChangeFor('bankAccountNumber', 'input')}
                        onBlur={handleChangeFor('bankAccountNumber', 'blur')}
                        required={true}
                        maxlength={12}
                    />
                </Field>

                <Field
                    label={i18n.get('eftpad-canada.input.institutionNumber.label')}
                    classNameModifiers={['col-50']}
                    errorMessage={!!errors.bankCode && i18n.get(errors.bankCode.errorMessage)}
                    isValid={!!valid.bankCode}
                    name={'bankCode'}
                    showContextualElement={showContextualElement}
                    contextualText={i18n.get('eftpad-canada.input.institutionNumber.contextualText')}
                >
                    <InputText
                        disabled={isFormDisabled}
                        name={'bankCode'}
                        placeholder={placeholders?.bankCode}
                        value={data.bankCode}
                        onInput={handleChangeFor('bankCode', 'input')}
                        onBlur={handleChangeFor('bankCode', 'blur')}
                        required={true}
                        maxlength={3}
                    />
                </Field>

                <Field
                    label={i18n.get('eftpad-canada.input.transitNumber.label')}
                    classNameModifiers={['col-50']}
                    errorMessage={!!errors.bankLocationId && i18n.get(errors.bankLocationId.errorMessage)}
                    name={'bankLocationId'}
                    isValid={!!valid.bankLocationId}
                    showContextualElement={showContextualElement}
                    contextualText={i18n.get('eftpad-canada.input.transitNumber.contextualText')}
                >
                    <InputText
                        disabled={isFormDisabled}
                        name={'bankLocationId'}
                        placeholder={placeholders?.bankLocationId}
                        value={data.bankLocationId}
                        onInput={handleChangeFor('bankLocationId', 'input')}
                        onBlur={handleChangeFor('bankLocationId', 'blur')}
                        required={true}
                        maxlength={5}
                    />
                </Field>
            </Fieldset>

            {enableStoreDetails && (
                <StoreDetails className={'adyen-checkout_eftpad-canada-store-details'} disabled={isFormDisabled} onChange={setStorePaymentMethod} />
            )}

            <SettlementInfo />

            {showPayButton && payButton({ status, icon: getImage({ imageFolder: 'components/' })('bento_lock') })}
        </div>
    );
}

export default PreAuthorizedDebitCanadaComponent;
