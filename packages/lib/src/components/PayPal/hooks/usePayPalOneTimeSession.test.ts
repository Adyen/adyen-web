import { renderHook } from '@testing-library/preact-hooks';
import { usePayPalOneTimeSession } from './usePayPalOneTimeSession';
import type { PayPalOneTimePaymentSession } from '../paypal-js-types';

describe('usePayPalOneTimeSession', () => {
    const createSessionMock = (): PayPalOneTimePaymentSession =>
        ({ start: jest.fn().mockResolvedValue(undefined) }) as unknown as PayPalOneTimePaymentSession;

    test('should create the payment session on mount', () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const createOrder = jest.fn();

        renderHook(() => usePayPalOneTimeSession({ createSession, createOrder }));

        expect(createSession).toHaveBeenCalledTimes(1);
    });

    test('should start the session with the createOrder promise when clicked', async () => {
        const session = createSessionMock();
        const createSession = jest.fn().mockReturnValue(session);
        const orderPromise = Promise.resolve({ orderId: 'order-1' });
        const createOrder = jest.fn().mockReturnValue(orderPromise);

        const { result } = renderHook(() => usePayPalOneTimeSession({ createSession, createOrder }));

        await result.current.onClick();

        expect(createOrder).toHaveBeenCalledTimes(1);
        expect(session.start).toHaveBeenCalledWith({ presentationMode: 'auto' }, orderPromise);
    });

    test('should do nothing when clicked before the session is created', async () => {
        const createSession = jest.fn().mockReturnValue(undefined);
        const createOrder = jest.fn();

        const { result } = renderHook(() => usePayPalOneTimeSession({ createSession, createOrder }));

        await result.current.onClick();

        expect(createOrder).not.toHaveBeenCalled();
    });
});
