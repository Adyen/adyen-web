import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayPalOneTimePaymentSession, PayPalPresentationModeOptions } from '../paypal-js-types';
import { useStartPayPalSession } from './useStartPayPalSession';

export const usePayPalOneTimeSession = ({
    createSession,
    createOrder,
    onError,
    presentationModeOptions
}: {
    presentationModeOptions?: PayPalPresentationModeOptions;
    createSession: () => PayPalOneTimePaymentSession | undefined;
    createOrder: () => Promise<{
        orderId: string;
    }>;
    onError: (error: Error) => void;
}) => {
    const [paymentSession, setPaymentSession] = useState<PayPalOneTimePaymentSession | undefined>();

    const startSession = useStartPayPalSession({ presentationModeOptions, onError });

    useEffect(() => {
        setPaymentSession(createSession());
    }, [createSession]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        await startSession(sessionOptions => paymentSession.start(sessionOptions, createOrder()));
    }, [paymentSession, createOrder, startSession]);

    return {
        onClick
    };
};
