import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { loginValidationRules } from './validate';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import useForm from '../../../../../utils/useForm';
import Field from '../../../FormFields/Field';
import InputEmail from '../../../FormFields/InputEmail';

type OnChangeProps = { data: CtPLoginInputDataState; valid; errors; isValid: boolean };

interface CtPLoginInputProps {
    disabled: boolean;
    errorMessage?: string;
    onPressEnter(): Promise<void>;
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

    const handleOnKeyPress = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                // Prevent <form> submission if Component is placed inside an form
                event.preventDefault();
                // Prevent global BaseElement keypress event to be triggered
                event.stopPropagation();
                void props.onPressEnter();
            }
        },
        [props.onPressEnter]
    );

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
            <InputEmail
                name={'shopperLogin'}
                autocorrect={'off'}
                spellcheck={false}
                value={data.shopperLogin}
                disabled={props.disabled}
                onInput={handleChangeFor('shopperLogin', 'input')}
                onBlur={handleChangeFor('shopperLogin', 'blur')}
                onKeyPress={handleOnKeyPress}
            />
        </Field>
    );
};

export default CtPLoginInput;
