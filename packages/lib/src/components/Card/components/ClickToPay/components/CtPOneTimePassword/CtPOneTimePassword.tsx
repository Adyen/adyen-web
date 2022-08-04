import { Fragment, h } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import Button from '../../../../../internal/Button';
import useClickToPayContext from '../../context/useClickToPayContext';
import CtPOneTimePasswordInput from '../CtPOneTimePasswordInput';
import { CtPOneTimePasswordInputHandlers } from '../CtPOneTimePasswordInput/CtPOneTimePasswordInput';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import './CtPOneTimePassword.scss';

const CtPOneTimePassword = (): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const { finishIdentityValidation, otpMaskedContact, isCtpPrimaryPaymentMethod } = useClickToPayContext();
    const [otp, setOtp] = useState<string>(null);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [isValidatingOtp, setIsValidatingOtp] = useState<boolean>(false);
    const [errorCode, setErrorCode] = useState<string>(null);
    const inputRef = useRef<CtPOneTimePasswordInputHandlers>(null);

    const onChangeOtpInput = useCallback(({ data, isValid }) => {
        setOtp(data.otp);
        setIsValid(isValid);
    }, []);

    const onSubmitPassword = useCallback(async () => {
        setErrorCode(null);

        if (!isValid) {
            inputRef.current.validateInput();
            return;
        }

        setIsValidatingOtp(true);

        try {
            await finishIdentityValidation(otp);
        } catch (error) {
            setErrorCode(error?.reason);
            setIsValidatingOtp(false);
        }
    }, [otp, isValid, inputRef.current]);

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__otp-title">{i18n.get('ctp.otp.title')}</div>
            <div className="adyen-checkout-ctp__otp-subtitle">
                Enter the code we sent to <span className="adyen-checkout-ctp__otp-subtitle--highlighted">{otpMaskedContact}</span> to confirm
                it&lsquo;s you
            </div>
            <CtPOneTimePasswordInput
                ref={inputRef}
                onChange={onChangeOtpInput}
                disabled={isValidatingOtp}
                errorMessage={errorCode && i18n.get(`ctp.errors.${errorCode}`)}
                onPressEnter={onSubmitPassword}
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
