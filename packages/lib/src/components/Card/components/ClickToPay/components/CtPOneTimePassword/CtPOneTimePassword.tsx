import { Fragment, h } from 'preact';
import Button from '../../../../../internal/Button';
import { useCallback, useState } from 'preact/hooks';
import useClickToPayContext from '../../context/useClickToPayContext';
import CtPOneTimePasswordInput from '../CtPOneTimePasswordInput';
import './CtPOneTimePassword.scss';

const CtPOneTimePassword = () => {
    const context = useClickToPayContext();
    const [otp, setOtp] = useState<string>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    console.log('otp', otp);

    const onChangeOtpInput = useCallback(
        ({ data }) => {
            setOtp(data.otp);
        },
        [setOtp]
    );

    const onSubmitPassword = useCallback(async () => {
        setIsLoading(true);
        console.log(otp);
        debugger;
        try {
            await context.onFinishIdentityValidation(otp);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }, [otp]);

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__otp-title">We need to verify you</div>
            <div className="adyen-checkout-ctp__otp-subtitle">
                Enter the code we sent to <span className="adyen-checkout-ctp__otp-subtitle--highlighted">{context.otpMaskedContact}</span> to confirm
                it&lsquo;s you
            </div>
            <CtPOneTimePasswordInput onChange={onChangeOtpInput} disabled={isLoading} />
            <Button label="Continue" onClick={onSubmitPassword} status={isLoading && 'loading'} />
        </Fragment>
    );
};

export default CtPOneTimePassword;
