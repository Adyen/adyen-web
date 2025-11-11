import { renderHook, act, waitFor } from '@testing-library/preact';
import { usePaymentStatusTimer } from './usePaymentStatusTimer';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import checkPaymentStatus from '../../core/Services/payment-status';
import { DEFAULT_PAYMENT_STATUS_TIMER_DELAY_MS } from './constants';

jest.mock('../../core/Services/payment-status');

describe('usePaymentStatusTimer', () => {
    const defaultProps = {
        loadingContext: 'test',
        paymentData: 'test-payment-data',
        clientKey: 'test-client-key',
        onError: jest.fn(),
        onComplete: jest.fn(),
        type: 'component'
    };

    beforeEach(() => {
        jest.useFakeTimers();
        (checkPaymentStatus as jest.Mock).mockResolvedValue({
            resultCode: 'pending',
            type: 'complete'
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('initial state', () => {
        it('should return initial state with correct values', () => {
            const { result } = renderHook(() => usePaymentStatusTimer(defaultProps));

            expect(result.current.state).toEqual({
                completed: false,
                expired: false,
                loading: true,
                percentage: 0,
                timePassed: 0
            });
        });

        it('should return actions object', () => {
            const { result } = renderHook(() => usePaymentStatusTimer(defaultProps));

            expect(result.current.actions).toHaveProperty('onTick');
            expect(result.current.actions).toHaveProperty('onTimeUp');
            expect(typeof result.current.actions.onTick).toBe('function');
            expect(typeof result.current.actions.onTimeUp).toBe('function');
        });
    });

    describe('onTick action', () => {
        it('should update percentage when onTick is called', () => {
            const { result } = renderHook(() => usePaymentStatusTimer(defaultProps));

            void act(() => {
                result.current.actions.onTick({ percentage: 50, minutes: 5, seconds: 0 });
            });

            expect(result.current.state.percentage).toBe(50);
        });
    });

    describe('onTimeUp action', () => {
        it('should set expired to true and call onError', () => {
            const { result } = renderHook(() => usePaymentStatusTimer(defaultProps));

            void act(() => {
                result.current.actions.onTimeUp();
            });

            expect(result.current.state.expired).toBe(true);
            expect(defaultProps.onError).toHaveBeenCalledWith(new AdyenCheckoutError('ERROR', 'Payment Expired'));
        });
    });

    describe('payment status polling', () => {
        it('should call checkStatus on mount', () => {
            (checkPaymentStatus as jest.Mock).mockResolvedValue({
                payload: 'test-payload',
                resultCode: 'authorised',
                type: 'complete'
            });

            renderHook(() => usePaymentStatusTimer(defaultProps));

            expect(checkPaymentStatus).toHaveBeenCalledWith(defaultProps.paymentData, defaultProps.clientKey, defaultProps.loadingContext, undefined);
        });

        it('should call onActionHandled with polling-started on first poll', () => {
            const onActionHandled = jest.fn();
            const propsWithAction = { ...defaultProps, onActionHandled };

            (checkPaymentStatus as jest.Mock).mockResolvedValue({
                payload: 'test-payload',
                resultCode: 'pending',
                type: 'complete'
            });

            renderHook(() => usePaymentStatusTimer(propsWithAction));

            expect(onActionHandled).toHaveBeenCalledWith({
                componentType: defaultProps.type,
                actionDescription: 'polling-started'
            });
        });

        it('should use custom pollStatus function when provided', () => {
            const customPollStatus = jest.fn().mockResolvedValue({
                payload: 'test-payload',
                resultCode: 'pending',
                type: 'complete'
            });
            const propsWithCustomPoll = { ...defaultProps, pollStatus: customPollStatus };

            renderHook(() => usePaymentStatusTimer(propsWithCustomPoll));

            expect(customPollStatus).toHaveBeenCalled();
            expect(checkPaymentStatus).not.toHaveBeenCalled();
        });
    });

    describe('success status handling', () => {
        it('should handle success status with payload', async () => {
            (checkPaymentStatus as jest.Mock).mockResolvedValue({
                payload: 'test-payload',
                resultCode: 'authorised'
            });

            const { result } = renderHook(() => usePaymentStatusTimer(defaultProps));

            await waitFor(() => {
                expect(result.current.state.completed).toBe(true);
            });

            expect(result.current.state.loading).toBe(false);
            expect(defaultProps.onComplete).toHaveBeenCalledWith({
                data: {
                    details: { payload: 'test-payload' },
                    paymentData: defaultProps.paymentData
                }
            });
        });

        it('should handle success status without payload', async () => {
            (checkPaymentStatus as jest.Mock).mockResolvedValue({
                resultCode: 'authorised'
            });

            const { result } = renderHook(() => usePaymentStatusTimer(defaultProps));

            await waitFor(() => {
                expect(result.current.state.expired).toBe(true);
            });

            expect(defaultProps.onError).toHaveBeenCalledWith(new AdyenCheckoutError('ERROR', 'successful result, but no payload in response'));
        });
    });

    describe('error status handling', () => {
        it('should handle error status with payload', async () => {
            (checkPaymentStatus as jest.Mock).mockResolvedValue({
                payload: 'error-payload',
                resultCode: 'refused'
            });

            const { result } = renderHook(() => usePaymentStatusTimer(defaultProps));

            void act(() => {
                jest.runAllTimers();
            });

            await waitFor(() => {
                expect(result.current.state.expired).toBe(true);
            });

            expect(result.current.state.loading).toBe(false);
            expect(defaultProps.onComplete).toHaveBeenCalledWith({
                data: {
                    details: { payload: 'error-payload' },
                    paymentData: defaultProps.paymentData
                }
            });
        });

        it('should handle error status without payload', async () => {
            (checkPaymentStatus as jest.Mock).mockResolvedValue({
                type: 'validation'
            });

            const { result } = renderHook(() => usePaymentStatusTimer(defaultProps));

            void act(() => {
                jest.runAllTimers();
            });

            await waitFor(() => {
                expect(result.current.state.expired).toBe(true);
            });
            expect(result.current.state.loading).toBe(false);
            expect(defaultProps.onError).toHaveBeenCalledWith(new AdyenCheckoutError('ERROR', 'error result with no payload in response'));
        });
    });

    describe('network error handling', () => {
        it('should handle network errors', async () => {
            const networkError = new Error('Network error');
            (checkPaymentStatus as jest.Mock).mockRejectedValue(networkError);
            jest.spyOn(globalThis, 'setTimeout');

            renderHook(() => usePaymentStatusTimer(defaultProps));

            await waitFor(() => {
                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), DEFAULT_PAYMENT_STATUS_TIMER_DELAY_MS);
            });
        });
    });

    describe('throttling behavior', () => {
        it('should use custom delay when provided', async () => {
            const propsWithDelay = { ...defaultProps, delay: 5000 };
            (checkPaymentStatus as jest.Mock).mockResolvedValue({
                resultCode: 'pending',
                type: 'complete'
            });
            jest.spyOn(globalThis, 'setTimeout');

            renderHook(() => usePaymentStatusTimer(propsWithDelay));

            await waitFor(() => {
                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
            });
        });

        it('should apply throttling when timePassed exceeds throttleTime', async () => {
            const props = {
                ...defaultProps,
                delay: 500,
                throttleTime: 500,
                throttleInterval: 1_000
            };

            (checkPaymentStatus as jest.Mock).mockResolvedValue({
                resultCode: 'pending',
                type: 'pending'
            });
            jest.spyOn(globalThis, 'setTimeout');

            renderHook(() => usePaymentStatusTimer(props));

            await waitFor(() => {
                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), props.delay);
            });

            void act(() => {
                jest.runAllTimers();
            });

            await waitFor(() => {
                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), props.throttleInterval);
            });
        });
    });

    describe('cleanup', () => {
        it('should clear timeout on unmount', async () => {
            (checkPaymentStatus as jest.Mock).mockResolvedValue({
                resultCode: 'pending',
                type: 'complete'
            });
            jest.spyOn(global, 'clearTimeout');
            jest.spyOn(global, 'setTimeout');

            const { unmount } = renderHook(() => usePaymentStatusTimer(defaultProps));

            await waitFor(() => {
                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), DEFAULT_PAYMENT_STATUS_TIMER_DELAY_MS);
            });

            void act(() => {
                unmount();
            });

            expect(clearTimeout).toHaveBeenCalled();
        });
    });
});
