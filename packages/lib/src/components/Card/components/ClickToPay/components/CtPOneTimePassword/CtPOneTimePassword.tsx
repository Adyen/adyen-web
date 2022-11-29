import { Fragment, h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import Button from '../../../../../internal/Button';
import useClickToPayContext from '../../context/useClickToPayContext';
import CtPOneTimePasswordInput from './CtPOneTimePasswordInput';
import { CtPOneTimePasswordInputHandlers } from './CtPOneTimePasswordInput/CtPOneTimePasswordInput';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import './CtPOneTimePassword.scss';

const CtPOneTimePassword = (): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const { finishIdentityValidation, otpMaskedContact, isCtpPrimaryPaymentMethod } = useClickToPayContext();
    const [otp, setOtp] = useState<string>(null);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [isValidatingOtp, setIsValidatingOtp] = useState<boolean>(false);
    const [errorCode, setErrorCode] = useState<string>(null);
    const [otpInputHandlers, setOtpInputHandlers] = useState<CtPOneTimePasswordInputHandlers>(null);
    const subtitleParts = i18n.get('ctp.otp.subtitle').split('%@');

    const onSetOtpInputHandlers = useCallback((handlers: CtPOneTimePasswordInputHandlers) => {
        setOtpInputHandlers(handlers);
    }, []);

    const onChangeOtpInput = useCallback(({ data, isValid }) => {
        setOtp(data.otp);
        setIsValid(isValid);
    }, []);

    const onResendCode = useCallback(() => {
        setErrorCode(null);
    }, []);

    const onSubmitPassword = useCallback(async () => {
        setErrorCode(null);

        if (!isValid) {
            otpInputHandlers.validateInput();
            return;
        }

        setIsValidatingOtp(true);

        try {
            await finishIdentityValidation(otp);
        } catch (error) {
            setErrorCode(error?.reason);
            setIsValidatingOtp(false);
        }
    }, [otp, isValid, otpInputHandlers]);

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__section-title">{i18n.get('ctp.otp.title')}</div>
            <div className="adyen-checkout-ctp__section-subtitle">
                {subtitleParts[0]}
                <span className="adyen-checkout-ctp__otp-subtitle--highlighted">{otpMaskedContact}</span>
                {subtitleParts[1]}
            </div>
            <CtPOneTimePasswordInput
                onChange={onChangeOtpInput}
                onSetInputHandlers={onSetOtpInputHandlers}
                disabled={isValidatingOtp}
                errorMessage={errorCode && i18n.get(`ctp.errors.${errorCode}`)}
                onPressEnter={onSubmitPassword}
                onResendCode={onResendCode}
                isValidatingOtp={isValidatingOtp}
            />
            <Button
                label={i18n.get('continue')}
                variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'}
                onClick={onSubmitPassword}
                status={isValidatingOtp && 'loading'}
            />
        </Fragment>
    );
};

export default CtPOneTimePassword;
