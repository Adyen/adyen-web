import { h } from 'preact';
import { useCallback, useEffect, useImperativeHandle } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import { loginValidationRules } from './validate';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import useForm from '../../../../../../utils/useForm';
import Field from '../../../../../internal/FormFields/Field';
import renderFormField from '../../../../../internal/FormFields';

interface CtPLoginInputProps {
    disabled: boolean;
    errorMessage?: string;
    onPressEnter(): void;
    onChange({ data: CtPLoginInputDataState, valid, errors, isValid: boolean }): void;
}

interface CtPLoginInputDataState {
    shopperLogin?: string;
}

export type CtPLoginInputHandlers = {
    validateInput(): void;
};

const CtPLoginInput = forwardRef<CtPLoginInputHandlers, CtPLoginInputProps>((props, ref) => {
    const { i18n } = useCoreContext();
    const formSchema = ['shopperLogin'];
    const { handleChangeFor, data, triggerValidation, valid, errors, isValid } = useForm<CtPLoginInputDataState>({
        schema: formSchema,
        rules: loginValidationRules
    });

    const validateInput = useCallback(() => {
        triggerValidation();
    }, [triggerValidation]);

    const handleOnKeyUp = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                props.onPressEnter();
            }
        },
        [props.onPressEnter]
    );

    useImperativeHandle(ref, () => ({ validateInput }));

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors]);

    return (
        <Field
            name="shopperLogin"
            label={i18n.get('ctp.login.inputLabel')}
            errorMessage={props.errorMessage || !!errors.shopperLogin}
            classNameModifiers={['shopperLogin']}
        >
            {renderFormField('text', {
                name: 'shopperLogin',
                autocorrect: 'off',
                spellcheck: false,
                value: data.shopperLogin,
                disabled: props.disabled,
                onInput: handleChangeFor('shopperLogin', 'input'),
                onBlur: handleChangeFor('shopperLogin', 'blur'),
                onKeyUp: handleOnKeyUp
            })}
        </Field>
    );
});

export default CtPLoginInput;
