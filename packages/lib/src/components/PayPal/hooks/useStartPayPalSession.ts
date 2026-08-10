import { useCallback } from 'preact/hooks';
import { PayPalError, PayPalPresentationModeOptions } from '../paypal-js-types';
import { DEFAULT_PAYMENT_SESSION_OPTIONS } from '../config';

type StartSession = (presentationModeOptions: PayPalPresentationModeOptions) => Promise<unknown>;

/**
 * Starts a PayPal payment session with the configured presentation mode.
 *
 * When the PayPal SDK fails to open the configured presentation mode, it rejects with a 'PaymentFlowError'. In that case
 * the session is started again with the auto presentation mode, letting the SDK decide how to present the payment flow.
 * Any other failure, as well as a failing retry, is reported through 'onError'.
 */
export const useStartPayPalSession = ({
    presentationModeOptions,
    onError
}: {
    presentationModeOptions?: PayPalPresentationModeOptions;
    onError: (error: Error) => void;
}) =>
    useCallback(
        async (startSession: StartSession) => {
            try {
                await startSession(presentationModeOptions?.presentationMode ? presentationModeOptions : DEFAULT_PAYMENT_SESSION_OPTIONS);
            } catch (error: unknown) {
                const paymentError = error as PayPalError;
                const shouldRetryWithAutoPresentationMode =
                    paymentError?.name === 'PaymentFlowError' && presentationModeOptions?.presentationMode !== 'auto';

                if (!shouldRetryWithAutoPresentationMode) {
                    onError(paymentError);
                    return;
                }

                console.warn('PayPal - PaymentFlowError occurred, retrying with auto presentation mode', paymentError);

                try {
                    await startSession(DEFAULT_PAYMENT_SESSION_OPTIONS);
                } catch (retryError: unknown) {
                    onError(retryError as PayPalError);
                }
            }
        },
        [presentationModeOptions, onError]
    );
