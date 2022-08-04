import { h } from 'preact';
import { useCallback, useEffect, useImperativeHandle, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import { otpValidationRules } from './validate';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import useForm from '../../../../../../utils/useForm';
import Field from '../../../../../internal/FormFields/Field';
import renderFormField from '../../../../../internal/FormFields';
import './CtPOneTimePasswordInput.scss';
import CtPResendOtpLink from './CtPResendOtpLink';

interface CtPOneTimePasswordInputProps {
    disabled: boolean;
    errorMessage?: string;
    onPressEnter(): Promise<void>;
    onChange({ data: CtPOneTimePasswordInputDataState, valid, errors, isValid: boolean }): void;
}

interface CtPOneTimePasswordInputDataState {
    otp?: string;
}

export type CtPOneTimePasswordInputHandlers = {
    validateInput(): void;
};

const CtPOneTimePasswordInput = forwardRef<CtPOneTimePasswordInputHandlers, CtPOneTimePasswordInputProps>((props, ref) => {
    const { i18n } = useCoreContext();
    const formSchema = ['otp'];
    const [resendOtpError, setResendOtpError] = useState<string>(null);
    const { handleChangeFor, data, triggerValidation, valid, errors, isValid } = useForm<CtPOneTimePasswordInputDataState>({
        schema: formSchema,
        rules: otpValidationRules
    });

    const handleOnResendOtpError = useCallback(
        (errorCode: string) => {
            const message = i18n.get(`ctp.errors.${errorCode}`);
            if (message) setResendOtpError(message);
        },
        [i18n]
    );

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
            name="oneTimePassword"
            label={i18n.get('ctp.otp.fieldLabel')}
            labelEndAdornment={<CtPResendOtpLink onError={handleOnResendOtpError} />}
            errorMessage={resendOtpError || props.errorMessage || !!errors.otp}
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
                onKeyUp: handleOnKeyUp
            })}
        </Field>
    );
});

export default CtPOneTimePasswordInput;
