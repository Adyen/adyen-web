import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { vpaValidationRules } from './validate';
import './VpaInput.scss';
import InputText from '../../../internal/FormFields/InputText';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useForm from '../../../../utils/useForm';
import Field from '../../../internal/FormFields/Field';
import { getErrorMessage } from '../../../../utils/getErrorMessage';

export type OnChangeProps = { data: VpaInputDataState; valid; errors; isValid: boolean };

interface VpaInputProps {
    showContextualElement: boolean;
    data?: {};
    disabled?: boolean;
    placeholder?: string;
    onChange({ data, valid, errors, isValid }: OnChangeProps): void;
    onSetInputHandlers(handlers: VpaInputHandlers): void;
}

export interface VpaInputDataState {
    virtualPaymentAddress?: string;
}

export type VpaInputHandlers = {
    validateInput(): void;
    showInvalidVpaError(): void;
};

const VpaInput = (props: VpaInputProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const formSchema = ['virtualPaymentAddress'];
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid, setErrors } = useForm<VpaInputDataState>({
        schema: formSchema,
        defaultData: props.data,
        rules: vpaValidationRules
    });

    const vpaInputHandlersRef = useRef<VpaInputHandlers>({
        validateInput: () => triggerValidation(),
        showInvalidVpaError: () => {
            const error = { isValid: false, errorMessage: 'upi.collect.field.invalid-id-error', shouldValidate: true };
            setErrors('virtualPaymentAddress', error);
        }
    });

    useEffect(() => {
        props.onSetInputHandlers(vpaInputHandlersRef.current);
    }, [props.onSetInputHandlers]);

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    return (
        <Field
            label={i18n.get('upi.collect.field.label')}
            errorMessage={getErrorMessage(i18n, errors.virtualPaymentAddress, i18n.get('upi.collect.field.label'), false)}
            classNameModifiers={['vpa']}
            name="virtualPaymentAddress"
            showContextualElement={props.showContextualElement}
            contextualText={i18n.get('upi.collect.field.contextualText')}
        >
            <InputText
                name={'virtualPaymentAddress'}
                autocorrect={'off'}
                spellcheck={false}
                placeholder={props.placeholder}
                disabled={props.disabled}
                value={data.virtualPaymentAddress}
                onInput={handleChangeFor('virtualPaymentAddress', 'input')}
                onBlur={handleChangeFor('virtualPaymentAddress', 'blur')}
                data-testid={'input-virtual-payment-address'}
            />
        </Field>
    );
};

export default VpaInput;
