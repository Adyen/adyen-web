import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { loginValidationRules } from './validate';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import useFormWithA11y from '../../../../../utils/useForm/useFormWithA11y';
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
    announceError(msg: string): void;
    focusInput(): void;
};

const CtPLoginInput = (props: Readonly<CtPLoginInputProps>): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const formSchema = ['shopperLogin'];
    const formRef = useRef<HTMLDivElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    const { handleChangeFor, data, triggerValidation, valid, errors, isValid, announceError } = useFormWithA11y<CtPLoginInputDataState>({
        schema: formSchema,
        rules: loginValidationRules,
        formRef
    });
    const loginInputHandlersRef = useRef<CtPLoginInputHandlers>({ validateInput: null, announceError: null, focusInput: null });
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
        loginInputHandlersRef.current.announceError = announceError;
        loginInputHandlersRef.current.focusInput = () => emailInputRef.current?.focus();
        props.onSetInputHandlers(loginInputHandlersRef.current);
    }, [validateInput, announceError, props.onSetInputHandlers]);

    const handleOnKeyPress = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                void props.onPressEnter();
            }
        },
        [props.onPressEnter]
    );

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors]);

    return (
        <div ref={formRef}>
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
                    setRef={el => {
                        emailInputRef.current = el;
                    }}
                />
            </Field>
        </div>
    );
};

export default CtPLoginInput;
