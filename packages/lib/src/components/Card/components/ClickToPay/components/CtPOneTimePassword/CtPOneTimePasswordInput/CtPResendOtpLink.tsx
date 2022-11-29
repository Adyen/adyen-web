import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import useClickToPayContext from '../../../context/useClickToPayContext';
import classnames from 'classnames';
import Icon from '../../../../../../internal/Icon';

const CONFIRMATION_SHOWING_TIME = 2000;

interface CtPResendOtpLinkProps {
    onError(errorCode: string): void;
    disabled: boolean;
}

const CtPResendOtpLink = ({ onError, disabled }: CtPResendOtpLinkProps): h.JSX.Element => {
    const [counter, setCounter] = useState<number>(null);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const { i18n } = useCoreContext();
    const { startIdentityValidation } = useClickToPayContext();

    useEffect(() => {
        let timeout = null;
        if (counter > 0) {
            timeout = setTimeout(() => setCounter(counter - 1), 1000);
        }
        return () => clearTimeout(timeout);
    }, [counter]);

    useEffect(() => {
        let timeout = null;

        if (showConfirmation) {
            timeout = setTimeout(() => {
                setShowConfirmation(false);
                setCounter(60);
            }, CONFIRMATION_SHOWING_TIME);
        }
        return () => clearTimeout(timeout);
    }, [showConfirmation]);

    const handleResendCodeClick = useCallback(
        async event => {
            event.preventDefault();

            try {
                setShowConfirmation(true);
                await startIdentityValidation();
            } catch (error) {
                onError(error.reason);
                setCounter(0);
                setShowConfirmation(false);
            }
        },
        [startIdentityValidation, onError]
    );

    if (showConfirmation) {
        return (
            <div className="adyen-checkout-ctp__otp-resend-code--confirmation">
                {i18n.get('ctp.otp.codeResent')}
                <Icon type="checkmark" height={14} width={14} />
            </div>
        );
    }

    if (counter > 0) {
        return (
            <div className="adyen-checkout-ctp__otp-resend-code--disabled">
                {i18n.get('ctp.otp.resendCode')} -{' '}
                <span className="adyen-checkout-ctp__otp-resend-code-counter"> {counter > 0 && `${counter}s`} </span>
            </div>
        );
    }

    return (
        <div
            role="link"
            tabIndex={0}
            className={classnames('adyen-checkout-ctp__otp-resend-code', { 'adyen-checkout-ctp__otp-resend-code--disabled': disabled })}
            onClick={handleResendCodeClick}
        >
            {i18n.get('ctp.otp.resendCode')}
        </div>
    );
};

export default CtPResendOtpLink;
