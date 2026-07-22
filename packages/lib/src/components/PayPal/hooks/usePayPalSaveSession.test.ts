import { renderHook } from '@testing-library/preact-hooks';
import { usePayPalSaveSession } from './usePayPalSaveSession';
import type { PayPalSavePaymentSession } from '../paypal-js-types';

describe('usePayPalSaveSession', () => {
    const createSessionMock = (): PayPalSavePaymentSession =>
        ({ start: jest.fn().mockResolvedValue(undefined) }) as unknown as PayPalSavePaymentSession;

    test('should create the payment session on mount', () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const createVaultSetupToken = jest.fn();

        renderHook(() => usePayPalSaveSession({ createSession, createVaultSetupToken }));

        expect(createSession).toHaveBeenCalledTimes(1);
    });

    test('should start the session with the createVaultSetupToken promise when clicked', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const tokenPromise = Promise.resolve({ vaultSetupToken: 'vault-token-1' });
        const createVaultSetupToken = jest.fn().mockReturnValue(tokenPromise);

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, createVaultSetupToken }));

        await result.current.onClick();

        expect(createVaultSetupToken).toHaveBeenCalledTimes(1);
        expect(session.start).toHaveBeenCalledWith({ presentationMode: 'auto' }, tokenPromise);
    });

    test('should do nothing when clicked before the session is created', async () => {
        const createSession = jest.fn().mockReturnValue(undefined);
        const createVaultSetupToken = jest.fn();

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, createVaultSetupToken }));

        await result.current.onClick();

        expect(createVaultSetupToken).not.toHaveBeenCalled();
    });
});
