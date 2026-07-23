import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayPalOneTimePaymentSession } from '../paypal-js-types';
import { PayPalPresentationModeOptions } from '../types';

export const usePayPalOneTimeSession = ({
    createSession,
    createOrder,
    presentationModeOptions
}: {
    presentationModeOptions: PayPalPresentationModeOptions;
    createSession: () => PayPalOneTimePaymentSession | undefined;
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

        await paymentSession.start(presentationModeOptions, createOrder());
    }, [paymentSession, createOrder, presentationModeOptions]);

    return {
        onClick
    };
};
