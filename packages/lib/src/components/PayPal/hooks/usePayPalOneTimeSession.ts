import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayPalOneTimePaymentSession, PayPalSessionStartOptions } from '../paypal-js-types';
import { useStartPayPalSession } from './useStartPayPalSession';

export const usePayPalOneTimeSession = ({
    createSession,
    onSubmit,
    onError,
    sandboxSupport
}: {
    sandboxSupport?: PayPalSessionStartOptions['sandboxSupport'];
    createSession: () => PayPalOneTimePaymentSession | undefined;
    onSubmit: () => Promise<string>;
    onError: (error: Error) => void;
}) => {
    const [paymentSession, setPaymentSession] = useState<PayPalOneTimePaymentSession | undefined>();

    const startSession = useStartPayPalSession({ sandboxSupport, onError });

    useEffect(() => {
        setPaymentSession(createSession());
    }, [createSession]);

    const createOrder = useCallback(async () => ({ orderId: await onSubmit() }), [onSubmit]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        const createOrderPromise = createOrder();

        await startSession(sessionOptions => paymentSession.start(sessionOptions, createOrderPromise));
    }, [paymentSession, createOrder, startSession]);

    return {
        onClick
    };
};
