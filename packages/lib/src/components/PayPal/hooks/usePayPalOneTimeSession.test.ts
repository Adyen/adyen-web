import { renderHook } from '@testing-library/preact-hooks';
import { usePayPalOneTimeSession } from './usePayPalOneTimeSession';
import type { PayPalError, PayPalOneTimePaymentSession, PayPalPresentationModeOptions } from '../paypal-js-types';

describe('usePayPalOneTimeSession', () => {
    const presentationModeOptions: PayPalPresentationModeOptions = { presentationMode: 'auto' };

    const createSessionMock = (): PayPalOneTimePaymentSession =>
        ({ start: jest.fn().mockResolvedValue(undefined) }) as unknown as PayPalOneTimePaymentSession;

    test('should create the payment session on mount', () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const createOrder = jest.fn();

        renderHook(() => usePayPalOneTimeSession({ createSession, createOrder, onError: jest.fn(), presentationModeOptions }));

        expect(createSession).toHaveBeenCalledTimes(1);
    });

    test('should start the session with the provided presentation mode options and the createOrder promise when clicked', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const orderPromise = Promise.resolve({ orderId: 'order-1' });
        const createOrder = jest.fn().mockReturnValue(orderPromise);

        const { result } = renderHook(() => usePayPalOneTimeSession({ createSession, createOrder, onError: jest.fn(), presentationModeOptions }));

        await result.current?.onClick();

        expect(createOrder).toHaveBeenCalledTimes(1);
        expect(session.start).toHaveBeenCalledWith(presentationModeOptions, orderPromise);
    });

    test('should forward custom presentation mode options to the session start', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const orderPromise = Promise.resolve({ orderId: 'order-1' });
        const createOrder = jest.fn().mockReturnValue(orderPromise);
        const modalOptions: PayPalPresentationModeOptions = { presentationMode: 'modal' };

        const { result } = renderHook(() =>
            usePayPalOneTimeSession({ createSession, createOrder, onError: jest.fn(), presentationModeOptions: modalOptions })
        );

        await result.current?.onClick();

        expect(session.start).toHaveBeenCalledWith(modalOptions, orderPromise);
    });

    test('should do nothing when clicked before the session is created', async () => {
        const createSession = jest.fn().mockReturnValue(undefined);
        const createOrder = jest.fn();

        const { result } = renderHook(() => usePayPalOneTimeSession({ createSession, createOrder, onError: jest.fn(), presentationModeOptions }));

        await result.current?.onClick();

        expect(createOrder).not.toHaveBeenCalled();
    });

    describe('error handling', () => {
        const createRecoverableError = () => {
            const error = new Error('Payment flow failed') as PayPalError;
            error.name = 'PaymentFlowError';
            error.code = 'PAYMENT_FLOW_ERROR';
            error.isRecoverable = true;
            return error;
        };

        const createFailingSessionMock = (error: unknown): PayPalOneTimePaymentSession =>
            ({ start: jest.fn().mockRejectedValueOnce(error).mockResolvedValue(undefined) }) as unknown as PayPalOneTimePaymentSession;

        beforeEach(() => {
            jest.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should retry with the auto presentation mode when the session fails with a recoverable error', async () => {
            const error = createRecoverableError();
            const session = createFailingSessionMock(error);
            const createSession = jest.fn().mockReturnValue(session);
            const createOrder = jest.fn().mockResolvedValue({ orderId: 'order-1' });
            const onError = jest.fn();
            const modalOptions: PayPalPresentationModeOptions = { presentationMode: 'modal' };

            const { result } = renderHook(() =>
                usePayPalOneTimeSession({ createSession, createOrder, onError, presentationModeOptions: modalOptions })
            );

            await result.current?.onClick();

            expect(session.start).toHaveBeenCalledTimes(2);
            expect(session.start).toHaveBeenLastCalledWith({ presentationMode: 'auto' }, expect.anything());
            expect(onError).not.toHaveBeenCalled();
        });

        test('should report the error raised by the session', async () => {
            const error = new Error('Session failed');
            const session = createFailingSessionMock(error);
            const createSession = jest.fn().mockReturnValue(session);
            const createOrder = jest.fn().mockResolvedValue({ orderId: 'order-1' });
            const onError = jest.fn();

            const { result } = renderHook(() => usePayPalOneTimeSession({ createSession, createOrder, onError, presentationModeOptions }));

            await result.current?.onClick();

            expect(session.start).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(error);
        });
    });
});
