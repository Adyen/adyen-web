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
        const createVaultSetupToken = jest.fn();

        renderHook(() => usePayPalSaveSession({ createSession, createVaultSetupToken, onError: jest.fn(), presentationModeOptions }));

        expect(createSession).toHaveBeenCalledTimes(1);
    });

    test('should start the session with the provided presentation mode options and the createVaultSetupToken promise when clicked', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const tokenPromise = Promise.resolve({ vaultSetupToken: 'vault-token-1' });
        const createVaultSetupToken = jest.fn().mockReturnValue(tokenPromise);

        const { result } = renderHook(() =>
            usePayPalSaveSession({ createSession, createVaultSetupToken, onError: jest.fn(), presentationModeOptions })
        );

        await result.current?.onClick();

        expect(createVaultSetupToken).toHaveBeenCalledTimes(1);
        expect(session.start).toHaveBeenCalledWith(presentationModeOptions, tokenPromise);
    });

    test('should forward custom presentation mode options to the session start', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const tokenPromise = Promise.resolve({ vaultSetupToken: 'vault-token-1' });
        const createVaultSetupToken = jest.fn().mockReturnValue(tokenPromise);
        const modalOptions: PayPalPresentationModeOptions = { presentationMode: 'modal' };

        const { result } = renderHook(() =>
            usePayPalSaveSession({ createSession, createVaultSetupToken, onError: jest.fn(), presentationModeOptions: modalOptions })
        );

        await result.current?.onClick();

        expect(session.start).toHaveBeenCalledWith(modalOptions, tokenPromise);
    });

    test('should do nothing when clicked before the session is created', async () => {
        const createSession = jest.fn().mockReturnValue(undefined);
        const createVaultSetupToken = jest.fn();

        const { result } = renderHook(() =>
            usePayPalSaveSession({ createSession, createVaultSetupToken, onError: jest.fn(), presentationModeOptions })
        );

        await result.current?.onClick();

        expect(createVaultSetupToken).not.toHaveBeenCalled();
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
            const createVaultSetupToken = jest.fn().mockResolvedValue({ vaultSetupToken: 'vault-token-1' });
            const onError = jest.fn();
            const modalOptions: PayPalPresentationModeOptions = { presentationMode: 'modal' };

            const { result } = renderHook(() =>
                usePayPalSaveSession({ createSession, createVaultSetupToken, onError, presentationModeOptions: modalOptions })
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
            const createVaultSetupToken = jest.fn().mockResolvedValue({ vaultSetupToken: 'vault-token-1' });
            const onError = jest.fn();

            const { result } = renderHook(() => usePayPalSaveSession({ createSession, createVaultSetupToken, onError, presentationModeOptions }));

            await result.current?.onClick();

            expect(session.start).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(error);
        });
    });
});
