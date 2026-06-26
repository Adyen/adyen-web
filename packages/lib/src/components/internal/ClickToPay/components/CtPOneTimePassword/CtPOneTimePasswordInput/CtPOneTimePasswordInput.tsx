import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { otpValidationRules } from './validate';
import CtPResendOtpLink from './CtPResendOtpLink';
import useClickToPayContext from '../../../context/useClickToPayContext';
import { useCoreContext } from '../../../../../../core/Context/CoreProvider';
import { useFormWithA11y } from '../../../../../../utils/useForm';
import { setFocusOnField } from '../../../../../../utils/setFocus';
import Field from '../../../../FormFields/Field';
import './CtPOneTimePasswordInput.scss';
import InputText from '../../../../FormFields/InputText';
import { getErrorMessage } from '../../../../../../utils/getErrorMessage';

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

const CtPOneTimePasswordInput = (props: Readonly<CtPOneTimePasswordInputProps>): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const {
        configuration: { disableOtpAutoFocus }
    } = useClickToPayContext();

    const formSchema = ['otp'];
    const [resendOtpError, setResendOtpError] = useState<string>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { handleChangeFor, data, triggerValidation, valid, errors, isValid, setData } = useFormWithA11y<CtPOneTimePasswordInputDataState>({
        schema: formSchema,
        rules: otpValidationRules,
        formHolder: containerRef
    });
    const otpInputHandlersRef = useRef<CtPOneTimePasswordInputHandlers>({ validateInput: null });
    const inputRef = useRef<HTMLInputElement>(null);
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
        if (!disableOtpAutoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef.current, disableOtpAutoFocus]);

    useEffect(() => {
        if (containerRef.current && props.errorMessage) {
            setFocusOnField(containerRef.current, 'otp');
        }
    }, [props.errorMessage]);

    useEffect(() => {
        otpInputHandlersRef.current.validateInput = validateInput;
        props.onSetInputHandlers(otpInputHandlersRef.current);
    }, [validateInput, props.onSetInputHandlers]);

    const handleOnResendOtp = useCallback(() => {
        setData('otp', '');
        setResendOtpError(null);
        if (!disableOtpAutoFocus) {
            inputRef.current.focus();
        }
        props.onResendCode();
    }, [props.onResendCode, inputRef.current, disableOtpAutoFocus]);

    const handleOnResendOtpError = useCallback(
        (errorCode: string) => {
            const message = i18n.get(`ctp.errors.${errorCode}`);
            if (message) setResendOtpError(message);
        },
        [i18n]
    );

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

    const getOtpErrorMessage = useCallback(() => {
        if (!isOtpFielDirty) return null;

        return resendOtpError || props.errorMessage || getErrorMessage(i18n, errors.otp, i18n.get('ctp.otp.fieldLabel'));
    }, [isOtpFielDirty, resendOtpError, props.errorMessage, errors.otp, i18n]);

    return (
        <div ref={containerRef} className={'adyen-checkout-ctp__otp-field-wrapper'}>
            <Field
                name="oneTimePassword"
                label={i18n.get('ctp.otp.fieldLabel')}
                errorMessage={getOtpErrorMessage()}
                classNameModifiers={['otp']}
                errorLive={true}
            >
                <InputText
                    name={'otp'}
                    autocorrect={'off'}
                    spellcheck={false}
                    value={data.otp}
                    disabled={props.disabled}
                    onInput={handleChangeFor('otp', 'input')}
                    onBlur={handleChangeFor('otp', 'blur')}
                    onKeyPress={handleOnKeyPress}
                    setRef={(ref: HTMLInputElement) => {
                        inputRef.current = ref;
                    }}
                    autocomplete={'off'}
                />
            </Field>
            <div className={'adyen-checkout-ctp__otp-resend-code-wrapper'}>
                <CtPResendOtpLink disabled={props.isValidatingOtp} onError={handleOnResendOtpError} onResendCode={handleOnResendOtp} />
            </div>
        </div>
    );
};

export default CtPOneTimePasswordInput;
