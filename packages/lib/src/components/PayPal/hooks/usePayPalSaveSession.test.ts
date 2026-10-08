import { renderHook } from '@testing-library/preact-hooks';
import { usePayPalSaveSession } from './usePayPalSaveSession';
import type { PayPalError, PayPalPresentationModeOptions, PayPalSavePaymentSession } from '../paypal-js-types';

describe('usePayPalSaveSession', () => {
    const presentationModeOptions: PayPalPresentationModeOptions = { presentationMode: 'auto' };

    const createSessionMock = (): PayPalSavePaymentSession =>
        ({ start: jest.fn().mockResolvedValue(undefined) }) as unknown as PayPalSavePaymentSession;

    test('should create the payment session on mount', () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const onSubmit = jest.fn();

        renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn(), presentationModeOptions }));

        expect(createSession).toHaveBeenCalledTimes(1);
    });

    test('should start the session with the provided presentation mode options and a vault setup token promise built from onSubmit when clicked', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const onSubmit = jest.fn().mockResolvedValue('vault-token-1');

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn(), presentationModeOptions }));

        await result.current?.onClick();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(session.start).toHaveBeenCalledWith(presentationModeOptions, expect.any(Promise));
        await expect((session.start as jest.Mock).mock.calls[0][1]).resolves.toEqual({ vaultSetupToken: 'vault-token-1' });
    });

    test('should reject the vault setup token promise when onSubmit fails', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const error = new Error('Could not create the vault setup token');
        const onSubmit = jest.fn().mockRejectedValue(error);

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn(), presentationModeOptions }));

        await result.current?.onClick();

        await expect((session.start as jest.Mock).mock.calls[0][1]).rejects.toThrow('Could not create the vault setup token');
    });

    test('should forward custom presentation mode options to the session start', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const onSubmit = jest.fn().mockResolvedValue('vault-token-1');
        const modalOptions: PayPalPresentationModeOptions = { presentationMode: 'modal' };

        const { result } = renderHook(() =>
            usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn(), presentationModeOptions: modalOptions })
        );

        await result.current?.onClick();

        expect(session.start).toHaveBeenCalledWith(modalOptions, expect.any(Promise));
    });

    test('should do nothing when clicked before the session is created', async () => {
        const createSession = jest.fn().mockReturnValue(undefined);
        const onSubmit = jest.fn();

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn(), presentationModeOptions }));

        await result.current?.onClick();

        expect(onSubmit).not.toHaveBeenCalled();
    });

    describe('error handling', () => {
        const createFailingSessionMock = (error: unknown): PayPalSavePaymentSession =>
            ({ start: jest.fn().mockRejectedValueOnce(error).mockResolvedValue(undefined) }) as unknown as PayPalSavePaymentSession;

        beforeEach(() => {
            jest.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should retry with the auto presentation mode when the session fails with a recoverable error', async () => {
            const error = new Error('Payment flow failed') as PayPalError;
            error.isRecoverable = true;
            const session = createFailingSessionMock(error);
            const createSession = jest.fn().mockReturnValue(session);
            const onSubmit = jest.fn().mockResolvedValue('vault-token-1');
            const onError = jest.fn();
            const modalOptions: PayPalPresentationModeOptions = { presentationMode: 'modal' };

            const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError, presentationModeOptions: modalOptions }));

            await result.current?.onClick();

            expect(session.start).toHaveBeenCalledTimes(2);
            expect(session.start).toHaveBeenLastCalledWith({ presentationMode: 'auto' }, expect.anything());
            expect(onError).not.toHaveBeenCalled();
        });

        test('should report the error raised by the session', async () => {
            const error = new Error('Session failed');
            const session = createFailingSessionMock(error);
            const createSession = jest.fn().mockReturnValue(session);
            const onSubmit = jest.fn().mockResolvedValue('vault-token-1');
            const onError = jest.fn();

            const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError, presentationModeOptions }));

            await result.current?.onClick();

            expect(session.start).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(error);
        });
    });
});
