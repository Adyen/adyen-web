import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { loginValidationRules } from './validate';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import useFormWithA11y from '../../../../../utils/useForm/useFormWithA11y';
import Field from '../../../FormFields/Field';
import InputEmail from '../../../FormFields/InputEmail';
import { setFocusOnField } from '../../../../../utils/setFocus';

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
    focusInput(): void;
};

const CTP_SECTION_SELECTOR = '.adyen-checkout-ctp__section';

const CtPLoginInput = (props: Readonly<CtPLoginInputProps>): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const formSchema = ['shopperLogin'];
    const { handleChangeFor, data, triggerValidation, valid, errors, isValid } = useFormWithA11y<CtPLoginInputDataState>({
        schema: formSchema,
        rules: loginValidationRules,
        formHolder: CTP_SECTION_SELECTOR
    });
    const loginInputHandlersRef = useRef<CtPLoginInputHandlers>({ validateInput: null, focusInput: null });
    const [isLoginInputDirty, setIsLoginInputDirty] = useState<boolean>(false);

    const validateInput = useCallback(() => {
        setIsLoginInputDirty(true);
        triggerValidation();
    }, [triggerValidation]);

    const focusInput = useCallback(() => {
        setFocusOnField(CTP_SECTION_SELECTOR, 'shopperLogin');
    }, []);

    useEffect(() => {
        if (data.shopperLogin) setIsLoginInputDirty(true);
    }, [data.shopperLogin]);

    useEffect(() => {
        loginInputHandlersRef.current.validateInput = validateInput;
        loginInputHandlersRef.current.focusInput = focusInput;
        props.onSetInputHandlers(loginInputHandlersRef.current);
    }, [validateInput, focusInput, props.onSetInputHandlers]);

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
        <Field
            name="shopperLogin"
            label={i18n.get('ctp.login.inputLabel')}
            errorMessage={isLoginInputDirty ? props.errorMessage || !!errors.shopperLogin : null}
            classNameModifiers={['shopperLogin']}
            errorLive
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
