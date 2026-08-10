import { renderHook } from '@testing-library/preact-hooks';
import { useStartPayPalSession } from './useStartPayPalSession';
import type { PayPalError, PayPalPresentationModeOptions } from '../paypal-js-types';

describe('useStartPayPalSession', () => {
    const modalOptions: PayPalPresentationModeOptions = { presentationMode: 'modal' };
    const autoOptions: PayPalPresentationModeOptions = { presentationMode: 'auto' };

    const createPaymentFlowError = () => {
        const error = new Error('Payment flow failed') as PayPalError;
        error.name = 'PaymentFlowError';
        error.code = 'PAYMENT_FLOW_ERROR';
        error.isRecoverable = true;
        return error;
    };

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should start the session with the configured presentation mode options', async () => {
        const startSession = jest.fn().mockResolvedValue(undefined);
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ presentationModeOptions: modalOptions, onError }));

        await result.current?.(startSession);

        expect(startSession).toHaveBeenCalledWith(modalOptions);
        expect(onError).not.toHaveBeenCalled();
    });

    test('should start the session with the auto presentation mode when no presentation mode is configured', async () => {
        const startSession = jest.fn().mockResolvedValue(undefined);
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ onError }));

        await result.current?.(startSession);

        expect(startSession).toHaveBeenCalledWith(autoOptions);
    });

    test('should retry with the auto presentation mode when the session fails with a PaymentFlowError', async () => {
        const startSession = jest.fn().mockRejectedValueOnce(createPaymentFlowError()).mockResolvedValue(undefined);
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ presentationModeOptions: modalOptions, onError }));

        await result.current?.(startSession);

        expect(startSession).toHaveBeenCalledTimes(2);
        expect(startSession).toHaveBeenLastCalledWith(autoOptions);
        expect(onError).not.toHaveBeenCalled();
    });

    test('should report the error raised by the retry', async () => {
        const retryError = new Error('Retry failed');
        const startSession = jest.fn().mockRejectedValueOnce(createPaymentFlowError()).mockRejectedValueOnce(retryError);
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ presentationModeOptions: modalOptions, onError }));

        await result.current?.(startSession);

        expect(onError).toHaveBeenCalledWith(retryError);
    });

    test('should report the error without retrying when the presentation mode is already auto', async () => {
        const error = createPaymentFlowError();
        const startSession = jest.fn().mockRejectedValue(error);
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ presentationModeOptions: autoOptions, onError }));

        await result.current?.(startSession);

        expect(startSession).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(error);
    });

    test('should report any other error without retrying', async () => {
        const error = new Error('Session failed');
        const startSession = jest.fn().mockRejectedValue(error);
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ presentationModeOptions: modalOptions, onError }));

        await result.current?.(startSession);

        expect(startSession).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(error);
    });

    test('should forward the value thrown by the session as-is', async () => {
        const startSession = jest.fn().mockRejectedValue('session unavailable');
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ presentationModeOptions: modalOptions, onError }));

        await result.current?.(startSession);

        expect(onError).toHaveBeenCalledWith('session unavailable');
    });
});
