import { useCallback } from 'preact/hooks';
import { PayPalError, PayPalSessionStartOptions } from '../paypal-js-types';
import { DEFAULT_PAYMENT_SESSION_OPTIONS } from '../config';

type StartSession = (sessionStartOptions: PayPalSessionStartOptions) => Promise<unknown>;

/**
 * Starts a PayPal payment session with the auto presentation mode, letting the SDK decide how to present the payment flow.
 * Any failure is reported through 'onError'.
 */
export const useStartPayPalSession = ({
    sandboxSupport,
    onError
}: {
    sandboxSupport?: PayPalSessionStartOptions['sandboxSupport'];
    onError: (error: Error) => void;
}) =>
    useCallback(
        async (startSession: StartSession) => {
            try {
                await startSession({ ...DEFAULT_PAYMENT_SESSION_OPTIONS, ...(sandboxSupport ? { sandboxSupport } : {}) });
            } catch (error: unknown) {
                onError(error as PayPalError);
            }
        },
        [sandboxSupport, onError]
    );
