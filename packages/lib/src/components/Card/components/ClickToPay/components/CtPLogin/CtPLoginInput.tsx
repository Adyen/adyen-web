import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { loginValidationRules } from './validate';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import useForm from '../../../../../../utils/useForm';
import Field from '../../../../../internal/FormFields/Field';
import renderFormField from '../../../../../internal/FormFields';

type OnChangeProps = { data: CtPLoginInputDataState; valid; errors; isValid: boolean };

interface CtPLoginInputProps {
    disabled: boolean;
    errorMessage?: string;
    onPressEnter(): void;
    onChange({ data, valid, errors, isValid }: OnChangeProps): void;
    onSetInputHandlers(handlers: CtPLoginInputHandlers): void;
}

interface CtPLoginInputDataState {
    shopperLogin?: string;
}

export type CtPLoginInputHandlers = {
    validateInput(): void;
};

const CtPLoginInput = (props: CtPLoginInputProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const formSchema = ['shopperLogin'];
    const { handleChangeFor, data, triggerValidation, valid, errors, isValid } = useForm<CtPLoginInputDataState>({
        schema: formSchema,
        rules: loginValidationRules
    });
    const loginInputHandlersRef = useRef<CtPLoginInputHandlers>({ validateInput: null });
    const [isLoginInputDirty, setIsLoginInputDirty] = useState<boolean>(false);

    const validateInput = useCallback(() => {
        setIsLoginInputDirty(true);
        triggerValidation();
    }, [triggerValidation]);

    useEffect(() => {
        if (data.shopperLogin) setIsLoginInputDirty(true);
    }, [data.shopperLogin]);

    useEffect(() => {
        loginInputHandlersRef.current.validateInput = validateInput;
        props.onSetInputHandlers(loginInputHandlersRef.current);
    }, [validateInput, props.onSetInputHandlers]);

    const handleOnKeyUp = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                props.onPressEnter();
            }
        },
        [props.onPressEnter]
    );

    const handleOnKeyPress = useCallback((event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
        // Prevent <form> submission if Component is placed inside an form
        if (event.key === 'Enter') event.preventDefault();
    }, []);

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors]);

    return (
        <Field
            name="shopperLogin"
            label={i18n.get('ctp.login.inputLabel')}
            errorMessage={isLoginInputDirty ? props.errorMessage || !!errors.shopperLogin : null}
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
                onKeyPress: handleOnKeyPress,
                onKeyUp: handleOnKeyUp
            })}
        </Field>
    );
};

export default CtPLoginInput;
