import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import LoadingWrapper from '../../internal/LoadingWrapper';
import InputText from '../../internal/FormFields/InputText';
import Field from '../../internal/FormFields/Field';
import useForm from '../../../utils/useForm';
import { ancvValidationRules } from '../validate';
import { ANCVDataState } from '../types';
import { ComponentMethodsRef } from '../../internal/UIElement/types';
import { PayButtonProps } from '../../internal/PayButton/PayButton';
import { ValidationRuleResult } from '../../../utils/Validator/ValidationRuleResult';

export interface ANCVInputProps {
    setComponentRef: (ref: ComponentMethodsRef) => void;
    showPayButton: boolean;
    onSubmit: () => void;
    payButton: (props: PayButtonProps) => h.JSX.Element;
    onChange: (data: {
        data: ANCVDataState;
        errors: { [key: string]: ValidationRuleResult };
        valid: { [key: string]: boolean };
        isValid: boolean;
    }) => void;
}

type ANCVInputDataState = ANCVDataState;

function ANCVInput({ payButton, onChange, onSubmit, setComponentRef }: Readonly<ANCVInputProps>) {
    const { i18n } = useCoreContext();

    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<ANCVInputDataState>({
        schema: ['beneficiaryId'],
        rules: ancvValidationRules
    });

    useEffect(() => {
        onChange({ data, errors, valid, isValid });
    }, [onChange, data, valid, errors, isValid]);

    const [status, setStatus] = useState<string>('ready');

    const ancvRef = useRef<ComponentMethodsRef>({
        setStatus,
        showValidation: triggerValidation
    });

    useEffect(() => {
        setComponentRef(ancvRef.current);
    }, [setComponentRef, ancvRef.current]);

    return (
        <LoadingWrapper>
            <div className="adyen-checkout__ancv">
                <p className="adyen-checkout-form-instruction">{i18n.get('ancv.form.instruction')}</p>
                <Field
                    errorMessage={!!errors.beneficiaryId && i18n.get(errors.beneficiaryId.errorMessage)}
                    label={i18n.get('ancv.input.label')}
                    isValid={valid.beneficiaryId}
                    name={'beneficiaryId'}
                >
                    <InputText
                        value={data.beneficiaryId}
                        name={'beneficiaryId'}
                        spellcheck={true}
                        required={true}
                        onInput={handleChangeFor('beneficiaryId', 'input')}
                        onBlur={handleChangeFor('beneficiaryId', 'blur')}
                        autocomplete={undefined}
                    />
                </Field>
                {payButton({ status, label: i18n.get('confirmPurchase'), onClick: onSubmit })}
            </div>
        </LoadingWrapper>
    );
}

ANCVInput.defaultProps = {};

export default ANCVInput;
