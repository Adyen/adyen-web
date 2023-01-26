import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import Field from '../../../internal/FormFields/Field';
import useForm from '../../../../utils/useForm';
import renderFormField from '../../../internal/FormFields';
import { vpaValidationRules } from './validate';
import './VpaInput.scss';

interface VpaInputProps {
    data?: {};
    disabled?: boolean;
    onChange({ data: VpaInputDataState, valid, errors, isValid: boolean }): void;
    onSetInputHandlers(handlers: VpaInputHandlers): void;
}

interface VpaInputDataState {
    virtualPaymentAddress?: string;
}

export type VpaInputHandlers = {
    validateInput(): void;
};

const VpaInput = (props: VpaInputProps): h.JSX.Element => {
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
            label="Virtual Payment Address"
            errorMessage={!!errors.virtualPaymentAddress}
            classNameModifiers={['vpa']}
            name="virtualPaymentAddress"
        >
            {renderFormField('text', {
                name: 'virtualPaymentAddress',
                autocorrect: 'off',
                spellcheck: false,
                disabled: props.disabled,
                value: data.virtualPaymentAddress,
                onInput: handleChangeFor('virtualPaymentAddress', 'input'),
                onBlur: handleChangeFor('virtualPaymentAddress', 'blur')
            })}
        </Field>
    );
};

export default VpaInput;
