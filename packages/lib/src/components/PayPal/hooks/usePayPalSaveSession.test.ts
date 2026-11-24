import { renderHook } from '@testing-library/preact-hooks';
import { usePayPalSaveSession } from './usePayPalSaveSession';
import type { PayPalSavePaymentSession } from '../paypal-js-types';

describe('usePayPalSaveSession', () => {
    const createSessionMock = (): PayPalSavePaymentSession =>
        ({ start: jest.fn().mockResolvedValue(undefined) }) as unknown as PayPalSavePaymentSession;

    test('should create the payment session on mount', () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const onSubmit = jest.fn();

        renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn() }));

        expect(createSession).toHaveBeenCalledTimes(1);
    });

    test('should start the session with the auto presentation mode and a vault setup token promise built from onSubmit when clicked', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const onSubmit = jest.fn().mockResolvedValue('vault-token-1');

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn() }));

        await result.current?.onClick();

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(session.start).toHaveBeenCalledWith({ presentationMode: 'auto' }, expect.any(Promise));
        await expect((session.start as jest.Mock).mock.calls[0][1]).resolves.toEqual({ vaultSetupToken: 'vault-token-1' });
    });

    test('should reject the vault setup token promise when onSubmit fails', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const error = new Error('Could not create the vault setup token');
        const onSubmit = jest.fn().mockRejectedValue(error);

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn() }));

        await result.current?.onClick();

        await expect((session.start as jest.Mock).mock.calls[0][1]).rejects.toThrow('Could not create the vault setup token');
    });

    test('should forward the sandbox support to the session start', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const onSubmit = jest.fn().mockResolvedValue('vault-token-1');
        const sandboxSupport = { enabled: true };

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn(), sandboxSupport }));

        await result.current?.onClick();

        expect(session.start).toHaveBeenCalledWith({ presentationMode: 'auto', sandboxSupport }, expect.any(Promise));
    });

    test('should do nothing when clicked before the session is created', async () => {
        const createSession = jest.fn().mockReturnValue(undefined);
        const onSubmit = jest.fn();

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError: jest.fn() }));

        await result.current?.onClick();

        expect(onSubmit).not.toHaveBeenCalled();
    });

    describe('error handling', () => {
        test('should report the error raised by the session', async () => {
            const error = new Error('Session failed');
            const session = { start: jest.fn().mockRejectedValueOnce(error) } as unknown as PayPalSavePaymentSession;
            const createSession = jest.fn().mockReturnValue(session);
            const onSubmit = jest.fn().mockResolvedValue('vault-token-1');
            const onError = jest.fn();

            const { result } = renderHook(() => usePayPalSaveSession({ createSession, onSubmit, onError }));

            await result.current?.onClick();

            expect(session.start).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(error);
        });
    });
});
