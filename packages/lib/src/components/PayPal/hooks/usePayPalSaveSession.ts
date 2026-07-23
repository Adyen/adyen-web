import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayPalSavePaymentSession } from '../paypal-js-types';
import { PayPalPresentationModeOptions } from '../types';

export const usePayPalSaveSession = ({
    presentationModeOptions,
    createSession,
    createVaultSetupToken
}: {
    presentationModeOptions: PayPalPresentationModeOptions;
    createSession: () => PayPalSavePaymentSession | undefined;
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

        await paymentSession.start(presentationModeOptions, createVaultSetupToken());
    }, [paymentSession, createVaultSetupToken, presentationModeOptions]);

    return {
        onClick
    };
};
