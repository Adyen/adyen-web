import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import Enrollment from '../Enrollment';
import Payment from '../Payment';
import { PayByBankPixProps } from './types';
import { IEnrollment } from '../Enrollment/types';

function PayByBankPix({
    type,
    clientKey,
    paymentMethodType,
    enrollmentId,
    txVariant,
    countdownTime,
    issuers,
    storedPaymentMethodId,
    onChange,
    onError,
    onSubmitAnalytics,
    showPayButton,
    payButton,
    setComponentRef
}: PayByBankPixProps) {
    const enrollmentRef = useRef<IEnrollment | null>();
    const shouldEnroll = storedPaymentMethodId == null;
    const self = useRef({
        showValidation: () => {
            enrollmentRef?.current?.showValidation();
        }
    });

    useEffect(() => {
        setComponentRef(self.current);
    }, [setComponentRef]);

    return shouldEnroll ? (
        <Enrollment
            onError={onError}
            // Await
            type={type}
            clientKey={clientKey}
            enrollmentId={enrollmentId}
            paymentMethodType={paymentMethodType}
            countdownTime={countdownTime}
            // Issuer List
            txVariant={txVariant}
            issuers={issuers}
            showPayButton={showPayButton}
            payButton={payButton}
            onChange={onChange}
            onSubmitAnalytics={onSubmitAnalytics}
            ref={enrollmentRef}
        />
    ) : (
        // @ts-ignore  // todo: filter out non matching device id stored pm
        <Payment payButton={payButton} showPayButton={showPayButton} storedPaymentMethodId={storedPaymentMethodId} />
    );
}

export default PayByBankPix;
