import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import Enrollment from '../Enrollment';
import Payment from '../Payment';
import { PayByBankPixProps } from './types';
import { IEnrollment } from '../Enrollment/types';

function PayByBankPix({
    type,
    issuers,
    showPayButton,
    paymentMethodType,
    url,
    timeoutMinutes,
    storedPaymentMethodId,
    onChange,
    setComponentRef,
    payButton,
    onSubmitAnalytics,
    txVariant
}: PayByBankPixProps) {
    const enrollmentRef = useRef<IEnrollment>();
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
            txVariant={txVariant}
            timeoutMinutes={timeoutMinutes}
            type={type}
            showPayButton={showPayButton}
            issuers={issuers}
            url={url}
            paymentMethodType={paymentMethodType}
            // @ts-ignore fix later
            onSubmitAnalytics={onSubmitAnalytics}
            onChange={onChange}
            payButton={payButton}
            ref={enrollmentRef}
        ></Enrollment>
    ) : (
        // @ts-ignore  // todo: filter out non matching device id stored pm
        <Payment showPayButton={showPayButton} storedPaymentMethodId={storedPaymentMethodId}></Payment>
    );
}

export default PayByBankPix;
