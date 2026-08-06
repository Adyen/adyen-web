import { renderHook } from '@testing-library/preact-hooks';
import { usePayPalSaveSession } from './usePayPalSaveSession';
import type { PayPalSavePaymentSession } from '../paypal-js-types';
import type { PayPalPresentationModeOptions } from '../types';

describe('usePayPalSaveSession', () => {
    const presentationModeOptions: PayPalPresentationModeOptions = { presentationMode: 'auto' };

    const createSessionMock = (): PayPalSavePaymentSession =>
        ({ start: jest.fn().mockResolvedValue(undefined) }) as unknown as PayPalSavePaymentSession;

    test('should create the payment session on mount', () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const createVaultSetupToken = jest.fn();

        renderHook(() => usePayPalSaveSession({ createSession, createVaultSetupToken, presentationModeOptions }));

        expect(createSession).toHaveBeenCalledTimes(1);
    });

    test('should start the session with the provided presentation mode options and the createVaultSetupToken promise when clicked', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const tokenPromise = Promise.resolve({ vaultSetupToken: 'vault-token-1' });
        const createVaultSetupToken = jest.fn().mockReturnValue(tokenPromise);

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, createVaultSetupToken, presentationModeOptions }));

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

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, createVaultSetupToken, presentationModeOptions: modalOptions }));

        await result.current?.onClick();

        expect(session.start).toHaveBeenCalledWith(modalOptions, tokenPromise);
    });

    test('should do nothing when clicked before the session is created', async () => {
        const createSession = jest.fn().mockReturnValue(undefined);
        const createVaultSetupToken = jest.fn();

        const { result } = renderHook(() => usePayPalSaveSession({ createSession, createVaultSetupToken, presentationModeOptions }));

        await result.current?.onClick();

        expect(createVaultSetupToken).not.toHaveBeenCalled();
    });
});
