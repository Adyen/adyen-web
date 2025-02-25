import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import Enrollment from '../Enrollment';
import Payment from '../Payment';
import { PayByBankPixProps } from './types';
import AdyenCheckoutError, { ERROR } from '../../../../core/Errors/AdyenCheckoutError';
import { usePasskeyService } from '../../hooks/usePasskeyService';

function PayByBankPix({
    type,
    clientKey,
    environment,
    paymentMethodType,
    enrollmentId,
    amount,
    issuer,
    txVariant,
    deviceId,
    countdownTime,
    issuers,
    storedPaymentMethodId,
    receiver,
    paymentDate,
    paymentMethod,
    onChange,
    onError,
    onSubmitAnalytics,
    payButton,
    setComponentRef,
    onEnrollment,
    onPayment
}: PayByBankPixProps) {
    const shouldEnroll = storedPaymentMethodId == null;
    const { passkeyService, error: passKeyInitError } = usePasskeyService({ environment, clientKey, deviceId });

    const onIssuerSelected = async payload => {
        try {
            const { data = {} } = payload;
            const riskSignals = await passkeyService.captureRiskSignalsEnrollment();
            onChange({ ...payload, data: { ...data, riskSignals } });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the onIssuerSelected';
            onError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    const onEnroll = async (registrationOptions: string): Promise<void> => {
        try {
            const fidoAssertion = await passkeyService.createCredentialForEnrollment(registrationOptions); // Create passkey and trigger biometrics
            onEnrollment({ enrollmentId, fidoAssertion });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the onEnroll';
            onError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    const onPay = async (): Promise<void> => {
        try {
            const riskSignals = await passkeyService.captureRiskSignalsAuthentication();
            const authenticatedCredential = await passkeyService.authenticateWithCredential('xxxxxx'); //todo: replace with BE
            onPayment({ riskSignals, authenticatedCredential });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the onPay';
            onError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    useEffect(() => {
        if (passKeyInitError) {
            onError(passKeyInitError);
        }
    }, [passKeyInitError]);

    // todo: uncomment it!
    /*    if (!passkeyService)
        return null;
    }*/

    return shouldEnroll ? (
        <Enrollment
            onError={onError}
            // Await
            type={type}
            clientKey={clientKey}
            enrollmentId={enrollmentId}
            paymentMethodType={paymentMethodType}
            countdownTime={countdownTime}
            onEnroll={onEnroll}
            // Issuer List
            txVariant={txVariant}
            issuers={issuers}
            payButton={payButton}
            onChange={onIssuerSelected}
            onSubmitAnalytics={onSubmitAnalytics}
            setComponentRef={setComponentRef}
        />
    ) : (
        // @ts-ignore  // todo: filter out non matching device id stored pm, show the rest props
        <Payment
            txVariant={txVariant}
            amount={amount}
            issuer={issuer}
            receiver={receiver}
            paymentMethod={paymentMethod}
            paymentDate={paymentDate}
            onPay={onPay}
        />
    );
}

export default PayByBankPix;
