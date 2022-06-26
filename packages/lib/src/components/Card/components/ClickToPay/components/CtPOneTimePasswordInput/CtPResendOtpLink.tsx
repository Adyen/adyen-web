import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import useClickToPayContext from '../../context/useClickToPayContext';

const CtPResendOtpLink = (): h.JSX.Element => {
    const [counter, setCounter] = useState<number>(null);
    const { i18n } = useCoreContext();
    const { startIdentityValidation } = useClickToPayContext();

    useEffect(() => {
        let timeout = null;
        if (counter > 0) {
            timeout = setTimeout(() => setCounter(counter - 1), 1000);
        }
        return () => clearTimeout(timeout);
    }, [counter]);

    const handleResendCodeClick = useCallback(
        async event => {
            event.stopPropagation();
            event.preventDefault();
            setCounter(60);

            try {
                await startIdentityValidation();
            } catch (error) {
                console.log(error);
            }
        },
        [startIdentityValidation]
    );

    if (counter > 0) {
        return (
            <div className="adyen-checkout-ctp__otp-resend-code--disabled">
                {i18n.get('ctp.otp.resendCode')} -{' '}
                <span className="adyen-checkout-ctp__otp-resend-code-counter"> {counter > 0 && `${counter}s`} </span>
            </div>
        );
    }

    return (
        <div role="link" tabIndex={0} className="adyen-checkout-ctp__otp-resend-code" onClick={handleResendCodeClick}>
            {i18n.get('ctp.otp.resendCode')}
        </div>
    );
};

export default CtPResendOtpLink;
