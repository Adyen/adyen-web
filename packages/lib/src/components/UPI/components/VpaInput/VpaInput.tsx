import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { vpaValidationRules } from './validate';
import './VpaInput.scss';
import InputText from '../../../internal/FormFields/InputText';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useForm from '../../../../utils/useForm';
import Field from '../../../internal/FormFields/Field';

export type OnChangeProps = { data: VpaInputDataState; valid; errors; isValid: boolean };

interface VpaInputProps {
    data?: {};
    disabled?: boolean;
    onChange({ data, valid, errors, isValid }: OnChangeProps): void;
    onSetInputHandlers(handlers: VpaInputHandlers): void;
}

export interface VpaInputDataState {
    virtualPaymentAddress?: string;
}

export type VpaInputHandlers = {
    validateInput(): void;
};

const VpaInput = (props: VpaInputProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const formSchema = ['virtualPaymentAddress'];
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<VpaInputDataState>({
        schema: formSchema,
        defaultData: props.data,
        rules: vpaValidationRules
    });
    const vpaInputHandlersRef = useRef<VpaInputHandlers>({ validateInput: null });

    const validateInput = useCallback(() => {
        triggerValidation();
    }, [triggerValidation]);

    useEffect(() => {
        vpaInputHandlersRef.current.validateInput = validateInput;
        props.onSetInputHandlers(vpaInputHandlersRef.current);
    }, [validateInput, props.onSetInputHandlers]);

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    return (
        <Field
            label={i18n.get('upi.collect.field.label')}
            errorMessage={!!errors.virtualPaymentAddress}
            classNameModifiers={['vpa']}
            name="virtualPaymentAddress"
        >
            <InputText
                name={'virtualPaymentAddress'}
                autocorrect={'off'}
                spellcheck={false}
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
