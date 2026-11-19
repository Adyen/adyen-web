import { renderHook } from '@testing-library/preact-hooks';
import { useStartPayPalSession } from './useStartPayPalSession';
import type { PayPalError } from '../paypal-js-types';

describe('useStartPayPalSession', () => {
    const createRecoverableError = () => {
        const error = new Error('Payment flow failed') as PayPalError;
        error.name = 'PaymentFlowError';
        error.code = 'PAYMENT_FLOW_ERROR';
        error.isRecoverable = true;
        return error;
    };

    test('should start the session with the auto presentation mode', async () => {
        const startSession = jest.fn().mockResolvedValue(undefined);
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ onError }));

        await result.current?.(startSession);

        expect(startSession).toHaveBeenCalledWith({ presentationMode: 'auto' });
        expect(onError).not.toHaveBeenCalled();
    });

    test('should start the session with the sandbox support when provided', async () => {
        const startSession = jest.fn().mockResolvedValue(undefined);
        const sandboxSupport = { enabled: true };

        const { result } = renderHook(() => useStartPayPalSession({ sandboxSupport, onError: jest.fn() }));

        await result.current?.(startSession);

        expect(startSession).toHaveBeenCalledWith({ presentationMode: 'auto', sandboxSupport });
    });

    test('should report a recoverable error without retrying', async () => {
        const error = createRecoverableError();
        const startSession = jest.fn().mockRejectedValue(error);
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ onError }));

        await result.current?.(startSession);

        expect(startSession).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(error);
    });

    test('should report a non recoverable error without retrying', async () => {
        const error = new Error('Session failed');
        const startSession = jest.fn().mockRejectedValue(error);
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ onError }));

        await result.current?.(startSession);

        expect(startSession).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(error);
    });

    test('should forward the value thrown by the session as-is', async () => {
        const startSession = jest.fn().mockRejectedValue('session unavailable');
        const onError = jest.fn();

        const { result } = renderHook(() => useStartPayPalSession({ onError }));

        await result.current?.(startSession);

        expect(onError).toHaveBeenCalledWith('session unavailable');
    });
});
