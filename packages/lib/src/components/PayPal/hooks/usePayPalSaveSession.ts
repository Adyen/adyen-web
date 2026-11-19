import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayPalPresentationModeOptions, PayPalSavePaymentSession } from '../paypal-js-types';
import { useStartPayPalSession } from './useStartPayPalSession';

export const usePayPalSaveSession = ({
    presentationModeOptions,
    createSession,
    onSubmit,
    onError
}: {
    presentationModeOptions?: PayPalPresentationModeOptions;
    createSession: () => PayPalSavePaymentSession | undefined;
    onSubmit: () => Promise<string>;
    onError: (error: Error) => void;
}) => {
    const [paymentSession, setPaymentSession] = useState<PayPalSavePaymentSession | undefined>();

    const startSession = useStartPayPalSession({ presentationModeOptions, onError });

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
