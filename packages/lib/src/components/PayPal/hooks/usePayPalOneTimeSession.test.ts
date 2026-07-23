import { renderHook } from '@testing-library/preact-hooks';
import { usePayPalOneTimeSession } from './usePayPalOneTimeSession';
import type { PayPalOneTimePaymentSession } from '../paypal-js-types';
import type { PayPalPresentationModeOptions } from '../types';

describe('usePayPalOneTimeSession', () => {
    const presentationModeOptions: PayPalPresentationModeOptions = { presentationMode: 'auto' };

    const createSessionMock = (): PayPalOneTimePaymentSession =>
        ({ start: jest.fn().mockResolvedValue(undefined) }) as unknown as PayPalOneTimePaymentSession;

    test('should create the payment session on mount', () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const createOrder = jest.fn();

        renderHook(() => usePayPalOneTimeSession({ createSession, createOrder, presentationModeOptions }));

        expect(createSession).toHaveBeenCalledTimes(1);
    });

    test('should start the session with the provided presentation mode options and the createOrder promise when clicked', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const orderPromise = Promise.resolve({ orderId: 'order-1' });
        const createOrder = jest.fn().mockReturnValue(orderPromise);

        const { result } = renderHook(() => usePayPalOneTimeSession({ createSession, createOrder, presentationModeOptions }));

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

        const { result } = renderHook(() => usePayPalOneTimeSession({ createSession, createOrder, presentationModeOptions: modalOptions }));

        await result.current?.onClick();

        expect(session.start).toHaveBeenCalledWith(modalOptions, orderPromise);
    });

    test('should do nothing when clicked before the session is created', async () => {
        const createSession = jest.fn().mockReturnValue(undefined);
        const createOrder = jest.fn();

        const { result } = renderHook(() => usePayPalOneTimeSession({ createSession, createOrder, presentationModeOptions }));

        await result.current?.onClick();

        expect(createOrder).not.toHaveBeenCalled();
    });
});
