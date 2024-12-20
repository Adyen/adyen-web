import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useClickToPayContext from '../../../context/useClickToPayContext';
import classnames from 'classnames';
import { useCoreContext } from '../../../../../../core/Context/CoreProvider';
import Icon from '../../../../Icon';
import { isSrciError } from '../../../services/utils';
import { PREFIX } from '../../../../Icon/constants';
import Button from '../../../../Button';

const CONFIRMATION_SHOWING_TIME = 2000;

interface CtPResendOtpLinkProps {
    onError(errorCode: string): void;
    onResendCode(): void;
    disabled: boolean;
}

const CtPResendOtpLink = ({ onError, onResendCode, disabled }: CtPResendOtpLinkProps): h.JSX.Element => {
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
            <div className="adyen-checkout-ctp__otp-resend-code--confirmation">
                {i18n.get('ctp.otp.codeResent')}
                <Icon type={`${PREFIX}checkmark`} height={14} width={14} />
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
