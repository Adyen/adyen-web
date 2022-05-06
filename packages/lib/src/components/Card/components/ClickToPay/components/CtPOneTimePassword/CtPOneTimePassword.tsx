import { Fragment, h } from 'preact';
import Button from '../../../../../internal/Button';
import { useCallback, useRef, useState } from 'preact/hooks';
import useClickToPayContext from '../../context/useClickToPayContext';
import CtPOneTimePasswordInput from '../CtPOneTimePasswordInput';
import './CtPOneTimePassword.scss';
import { CtPOneTimePasswordInputHandlers } from '../CtPOneTimePasswordInput/CtPOneTimePasswordInput';

const CtPOneTimePassword = () => {
    const context = useClickToPayContext();
    const [otp, setOtp] = useState<string>(null);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorCode, setErrorCode] = useState<string>(null);
    const inputRef = useRef<CtPOneTimePasswordInputHandlers>(null);

    const onChangeOtpInput = useCallback(
        ({ data, isValid }) => {
            setOtp(data.otp);
            setIsValid(isValid);
        },
        [setOtp]
    );

    const onSubmitPassword = useCallback(async () => {
        setErrorCode(null);

        if (!isValid) {
            inputRef.current.validateInput();
            return;
        }

        setIsLoading(true);

        try {
            await context.finishIdentityValidation(otp);
        } catch (error) {
            console.log(error);
            setErrorCode(error?.error?.reason);
            setIsLoading(false);
        }
    }, [otp, isValid, inputRef.current]);

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__otp-title">We need to verify you</div>
            <div className="adyen-checkout-ctp__otp-subtitle">
                Enter the code we sent to <span className="adyen-checkout-ctp__otp-subtitle--highlighted">{context.otpMaskedContact}</span> to confirm
                it&lsquo;s you
            </div>
            <CtPOneTimePasswordInput ref={inputRef} onChange={onChangeOtpInput} disabled={isLoading} errorCode={errorCode} />
            <Button label="Continue" onClick={onSubmitPassword} status={isLoading && 'loading'} />
        </Fragment>
    );
};

export default CtPOneTimePassword;
