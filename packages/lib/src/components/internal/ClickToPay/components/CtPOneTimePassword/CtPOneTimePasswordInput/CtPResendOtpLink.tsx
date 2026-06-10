import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useClickToPayContext from '../../../context/useClickToPayContext';
import classnames from 'classnames';
import { useCoreContext } from '../../../../../../core/Context/CoreProvider';
import { useA11yReporter } from '../../../../../../core/Errors/useA11yReporter';
import Icon from '../../../../Icon';
import { isSrciError } from '../../../services/utils';
import { PREFIX } from '../../../../Icon/constants';
import Button from '../../../../Button';

const CONFIRMATION_SHOWING_TIME = 2000;
const RESEND_OTP_COUNTDOWN_SECONDS = 60;

interface CtPResendOtpLinkProps {
    onError(errorCode: string): void;
    onResendCode(): void;
    disabled: boolean;
}

const CtPResendOtpLink = ({ onError, onResendCode, disabled }: Readonly<CtPResendOtpLinkProps>): h.JSX.Element => {
    const [counter, setCounter] = useState<number>(null);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const { i18n } = useCoreContext();
    const { startIdentityValidation } = useClickToPayContext();
    const [resendStatusMessage, setResendStatusMessage] = useState<string>(null);
    useA11yReporter(resendStatusMessage);

    useEffect(() => {
        let timeout = null;
        if (counter > 0) {
            timeout = setTimeout(() => setCounter(counter - 1), 1000);
        }
        if (counter === RESEND_OTP_COUNTDOWN_SECONDS) {
            setResendStatusMessage(`${i18n.get('ctp.otp.resendCode')} - ${counter}s`);
        } else if (counter === 0) {
            setResendStatusMessage(i18n.get('ctp.otp.resendCode'));
        }
        return () => clearTimeout(timeout);
    }, [counter]);

    useEffect(() => {
        let timeout = null;

        if (showConfirmation) {
            timeout = setTimeout(() => {
                setShowConfirmation(false);
                setCounter(RESEND_OTP_COUNTDOWN_SECONDS);
            }, CONFIRMATION_SHOWING_TIME);
        }
        return () => clearTimeout(timeout);
    }, [showConfirmation]);

    const handleResendCodeClick = useCallback(
        async event => {
            event.preventDefault();

            try {
                onResendCode();
                setShowConfirmation(true);
                await startIdentityValidation();
            } catch (error: unknown) {
                setCounter(0);
                setShowConfirmation(false);

                if (!isSrciError(error)) {
                    console.error(error);
                    return;
                }

                onError(error.reason);
            }
        },
        [startIdentityValidation, onError, onResendCode]
    );

    if (showConfirmation) {
        return (
            <div role="alert" className="adyen-checkout-ctp__otp-resend-code--confirmation">
                {i18n.get('ctp.otp.codeResent')}
                <Icon type={`${PREFIX}checkmark_black`} height={14} width={14} />
            </div>
        );
    }

    if (counter > 0) {
        return (
            <div role="timer" className="adyen-checkout-ctp__otp-resend-code--disabled">
                {i18n.get('ctp.otp.resendCode')} -{' '}
                <span className="adyen-checkout-ctp__otp-resend-code-counter"> {counter > 0 && `${counter}s`} </span>
            </div>
        );
    }

    return (
        <Button
            classNameModifiers={[classnames('otp-resend-code', { 'otp-resend-code--disabled': disabled })]}
            onClick={handleResendCodeClick}
            variant="link"
            inline={true}
            disabled={disabled}
        >
            {i18n.get('ctp.otp.resendCode')}
        </Button>
    );
};

export default CtPResendOtpLink;
