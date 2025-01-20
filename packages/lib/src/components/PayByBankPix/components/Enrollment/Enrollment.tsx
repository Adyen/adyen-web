import { h } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import IssuerList from '../../../internal/IssuerList';
import { EnrollmentProps } from './types';
import type { UIElementStatus } from '../../../internal/UIElement/types';
import Await from '../../../internal/Await';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

function Enrollment({ issuers, type, url, paymentMethodType, showPayButton, payButton, onChange }: EnrollmentProps) {
    const { i18n } = useCoreContext();

    const [status, setStatus] = useState('ready');
    const buttonModifiers = ['standalone'];

    const onComplete = (state): void => {
        console.log({ state });
        // todo: collect biometrics and call internal endpoint
        // /details call with response of the internal endpoint
    };

    return (
        <div className={'adyen-checkout-pix-biometric'}>
            {type === 'await' ? (
                <Await
                    url={url}
                    type={paymentMethodType}
                    showCountdownTimer
                    shouldRedirectAutomatically
                    countdownTime={5}
                    clientKey={''}
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
                    items={issuers}
                    onSubmitAnalytics={() => {}}
                    onChange={onChange}
                    payButton={payButton}
                    showPayButton={showPayButton}
                ></IssuerList>
            )}
        </div>
    );
}

export default Enrollment;
