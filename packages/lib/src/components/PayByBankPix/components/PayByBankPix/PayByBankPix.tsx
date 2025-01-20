import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import Enrollment from '../Enrollment';
import Payment from '../Payment';
import { PayByBankPixProps } from './types';
import type { UIElementStatus } from '../../../internal/UIElement/types';

function PayByBankPix({
    type,
    issuers,
    showPayButton,
    paymentMethodType,
    url,
    storedPaymentMethodId,
    onChange,
    setComponentRef,
    payButton
}: PayByBankPixProps) {
    const [status, setStatus] = useState('ready');
    const enrollmentRef = useRef<typeof Enrollment>();
    const self = useRef({
        setStatus: (status: UIElementStatus) => setStatus(status),
        validate: () => {
            enrollmentRef?.validate();
        }
    });
    const shouldEnroll = storedPaymentMethodId == null;

    useEffect(() => {
        setComponentRef(self.current);
    }, [setComponentRef]);

    return shouldEnroll ? (
        <Enrollment
            type={type}
            showPayButton={showPayButton}
            issuers={issuers}
            url={url}
            paymentMethodType={paymentMethodType}
            // @ts-ignore fix later
            onSubmitAnalytics={() => {}}
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
