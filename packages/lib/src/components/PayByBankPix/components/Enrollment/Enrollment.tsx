import { h } from 'preact';
import { useRef } from 'preact/hooks';
import { EnrollmentProps } from './types';
import Await from '../../../internal/Await';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { IIssuerList } from '../../../internal/IssuerList/types';
import IssuerList from '../../../internal/IssuerList';
import { useIssuerWithLogo } from './useIssuerWithLogo';

function Enrollment({
    issuers,
    type,
    txVariant,
    url,
    clientKey,
    timeoutMinutes,
    paymentMethodType,
    showPayButton,
    payButton,
    onChange
}: EnrollmentProps) {
    const { i18n } = useCoreContext();
    const issuersWithLogo = useIssuerWithLogo({ issuers, txVariant });
    const issuerListRef = useRef<IIssuerList>();

    const onComplete = (state): void => {
        // todo: collect biometrics and call internal endpoint
        // /details call with response of the internal endpoint
    };

    this.showValidation = () => {
        issuerListRef.current?.showValidation();
    };

    return (
        //todo
        <div className={'adyen-checkout-pix-biometric'}>
            {type === 'await' ? (
                <Await
                    url={url}
                    type={paymentMethodType}
                    showCountdownTimer
                    shouldRedirectAutomatically
                    countdownTime={timeoutMinutes}
                    clientKey={clientKey}
                    paymentData={''}
                    onActionHandled={() => {}}
                    onError={() => {}}
                    messageText={i18n.get('upi.vpaWaitingMessage')}
                    awaitText={i18n.get('await.waitForConfirmation')}
                    onComplete={onComplete}
                    brandLogo={''}
                ></Await>
            ) : (
                <IssuerList
                    items={issuersWithLogo}
                    onSubmitAnalytics={() => {}}
                    onChange={onChange}
                    payButton={payButton}
                    showPayButton={showPayButton}
                    ref={issuerListRef}
                ></IssuerList>
            )}
        </div>
    );
}

export default Enrollment;
