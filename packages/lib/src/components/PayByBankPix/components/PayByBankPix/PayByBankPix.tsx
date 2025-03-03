import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import Enrollment from '../Enrollment';
import Payment from '../Payment';
import { PayByBankPixProps } from './types';
import { DecodeObject } from '../../../../types/global-types';
import base64 from '../../../../utils/base64';
import AdyenCheckoutError, { ERROR, SDK_ERROR } from '../../../../core/Errors/AdyenCheckoutError';
import { usePasskeyService } from '../../hooks/usePasskeyService';

function PayByBankPix({
    type,
    clientKey,
    environment,
    paymentMethodType,
    enrollmentId,
    txVariant,
    countdownTime,
    issuers,
    storedPaymentMethodId,
    onChange,
    onError,
    onSubmitAnalytics,
    payButton,
    setComponentRef,
    onEnrollment
}: PayByBankPixProps) {
    const shouldEnroll = storedPaymentMethodId == null;
    const { passkeyService, error: passKeyInitError } = usePasskeyService({ environment, clientKey });

    const onIssuerSelected = async payload => {
        const { data = {} } = payload;
        const riskSignals = await passkeyService?.getRiskSignalsEnrollment();
        onChange({ ...payload, data: { ...data, riskSignals } });
    };

    const onEnroll = async (registrationOptions: string): Promise<void> => {
        try {
            const decodedResult: DecodeObject = base64.decode(registrationOptions);
            if (!decodedResult.success) {
                onError(new AdyenCheckoutError(SDK_ERROR, 'Failed to decode enrollment'));
            } else {
                const enrollment = JSON.parse(decodedResult.data);
                const fidoAssertion = await passkeyService.createCredentialForEnrollment(enrollment);
                onEnrollment({ enrollmentId, fidoAssertion }); // Create passkey and trigger biometrics
            }
        } catch (e) {
            onError(new AdyenCheckoutError(ERROR, 'Failed to complete enrollment'));
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
        <Payment payButton={payButton} storedPaymentMethodId={storedPaymentMethodId} />
    );
}

export default PayByBankPix;
