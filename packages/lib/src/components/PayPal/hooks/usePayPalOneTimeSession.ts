import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayPalOneTimePaymentSession } from '../paypal-js-types';
import { PayPalPresentationModeOptions } from '../types';
import { DEFAULT_PAYMENT_SESSION_OPTIONS } from '../config';

export const usePayPalOneTimeSession = ({
    createSession,
    createOrder,
    presentationModeOptions
}: {
    presentationModeOptions?: PayPalPresentationModeOptions;
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

        await paymentSession.start(
            presentationModeOptions?.presentationMode ? presentationModeOptions : DEFAULT_PAYMENT_SESSION_OPTIONS,
            createOrder()
        );
    }, [paymentSession, createOrder, presentationModeOptions]);

    return {
        onClick
    };
};
