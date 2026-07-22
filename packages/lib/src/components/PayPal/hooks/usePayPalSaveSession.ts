import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayPalSavePaymentSession } from '../paypal-js-types';

export const usePayPalSaveSession = ({
    createSession,
    createVaultSetupToken
}: {
    createSession: () => PayPalSavePaymentSession;
    createVaultSetupToken: () => Promise<{
        vaultSetupToken: string;
    }>;
}) => {
    const [paymentSession, setPaymentSession] = useState<PayPalSavePaymentSession | undefined>();

    useEffect(() => {
        setPaymentSession(createSession());
    }, [createSession]);

    const onClick = useCallback(async () => {
        if (!paymentSession) return;

        await paymentSession.start({ presentationMode: 'auto' }, createVaultSetupToken());
    }, [paymentSession, createVaultSetupToken]);

    return {
        onClick
    };
};
