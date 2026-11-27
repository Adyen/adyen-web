import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayPalSavePaymentSession, PayPalSessionStartOptions } from '../paypal-js-types';
import { useStartPayPalSession } from './useStartPayPalSession';

export const usePayPalSaveSession = ({
    sandboxSupport,
    createSession,
    onSubmit,
    onError
}: {
    sandboxSupport?: PayPalSessionStartOptions['sandboxSupport'];
    createSession: () => PayPalSavePaymentSession | undefined;
    onSubmit: () => Promise<string>;
    onError: (error: Error) => void;
}) => {
    const [paymentSession, setPaymentSession] = useState<PayPalSavePaymentSession | undefined>();

    const startSession = useStartPayPalSession({ sandboxSupport, onError });

    useEffect(() => {
        setPaymentSession(createSession());
    }, [createSession]);

    const createVaultSetupToken = useCallback(async () => ({ vaultSetupToken: await onSubmit() }), [onSubmit]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        const createVaultSetupTokenPromise = createVaultSetupToken();

        await startSession(sessionOptions => paymentSession.start(sessionOptions, createVaultSetupTokenPromise));
    }, [paymentSession, createVaultSetupToken, startSession]);

    return {
        onClick
    };
};
