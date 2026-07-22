import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayPalOneTimePaymentSession } from '../paypal-js-types';

export const usePayPalOneTimeSession = ({
    createSession,
    createOrder
}: {
    createSession: () => PayPalOneTimePaymentSession;
    createOrder: () => Promise<{
        orderId: string;
    }>;
}) => {
    const [paymentSession, setPaymentSession] = useState<PayPalOneTimePaymentSession | undefined>();

    useEffect(() => {
        setPaymentSession(createSession());
    }, [createSession]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        await paymentSession.start({ presentationMode: 'auto' }, createOrder());
    }, [paymentSession, createOrder]);

    return {
        onClick
    };
};
