import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { otpValidationRules } from './validate';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import useForm from '../../../../../../../utils/useForm';
import Field from '../../../../../../internal/FormFields/Field';
import renderFormField from '../../../../../../internal/FormFields';
import './CtPOneTimePasswordInput.scss';
import CtPResendOtpLink from './CtPResendOtpLink';

type OnChangeProps = { data: CtPOneTimePasswordInputDataState; valid; errors; isValid: boolean };

interface CtPOneTimePasswordInputProps {
    hideResendOtpButton: boolean;
    disabled: boolean;
    isValidatingOtp: boolean;
    errorMessage?: string;
    onSetInputHandlers(handlers: CtPOneTimePasswordInputHandlers): void;
    onPressEnter(): Promise<void>;
    onChange({ data, valid, errors, isValid }: OnChangeProps): void;
    onResendCode(): void;
}

interface CtPOneTimePasswordInputDataState {
    otp?: string;
}

export type CtPOneTimePasswordInputHandlers = {
    validateInput(): void;
};

const CtPOneTimePasswordInput = (props: CtPOneTimePasswordInputProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const formSchema = ['otp'];
    const [resendOtpError, setResendOtpError] = useState<string>(null);
    const { handleChangeFor, data, triggerValidation, valid, errors, isValid, setData } = useForm<CtPOneTimePasswordInputDataState>({
        schema: formSchema,
        rules: otpValidationRules
    });
    const otpInputHandlersRef = useRef<CtPOneTimePasswordInputHandlers>({ validateInput: null });
    const [inputRef, setInputRef] = useState<HTMLInputElement>(null);
    const [isOtpFielDirty, setIsOtpFieldDirty] = useState<boolean>(false);

    const validateInput = useCallback(() => {
        setIsOtpFieldDirty(true);
        triggerValidation();
    }, [triggerValidation]);

    /**
     * If shopper changes the value of the OTP fields, input becomes dirty
     */
    useEffect(() => {
        if (data.otp) setIsOtpFieldDirty(true);
    }, [data.otp]);

    useEffect(() => {
        if (inputRef) {
            inputRef.focus();
        }
    }, [inputRef]);

    useEffect(() => {
        otpInputHandlersRef.current.validateInput = validateInput;
        props.onSetInputHandlers(otpInputHandlersRef.current);
    }, [validateInput, props.onSetInputHandlers]);

    const handleOnResendOtp = useCallback(() => {
        setData('otp', '');
        setResendOtpError(null);
        inputRef.focus();
        props.onResendCode();
    }, [props.onResendCode, inputRef]);

    const handleOnResendOtpError = useCallback(
        (errorCode: string) => {
            const message = i18n.get(`ctp.errors.${errorCode}`);
            if (message) setResendOtpError(message);
        },
        [i18n]
    );

    const handleOnKeyUp = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                props.onPressEnter();
            }
        },
        [props.onPressEnter]
    );

    useEffect(() => {
        props.onChange({ data, valid, errors, isValid });
    }, [data, valid, errors]);

    return (
        <Field
            name="oneTimePassword"
            label={i18n.get('ctp.otp.fieldLabel')}
            labelEndAdornment={
                !props.hideResendOtpButton && (
                    <CtPResendOtpLink disabled={props.isValidatingOtp} onError={handleOnResendOtpError} onResendCode={handleOnResendOtp} />
                )
            }
            errorMessage={isOtpFielDirty ? resendOtpError || props.errorMessage || !!errors.otp : null}
            classNameModifiers={['otp']}
        >
            {renderFormField('text', {
                name: 'otp',
                autocorrect: 'off',
                spellcheck: false,
                value: data.otp,
                disabled: props.disabled,
                onInput: handleChangeFor('otp', 'input'),
                onBlur: handleChangeFor('otp', 'blur'),
                onKeyUp: handleOnKeyUp,
                onCreateRef: setInputRef
            })}
        </Field>
    );
};

export default CtPOneTimePasswordInput;
