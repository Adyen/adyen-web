import { renderHook } from '@testing-library/preact-hooks';
import { useCreateOrder } from './useCreateOrder';

describe('useCreateOrder', () => {
    test('should return a function that calls onSubmit and wraps the result in an orderId object', async () => {
        const onSubmit = jest.fn().mockResolvedValue('order-123');

        const { result } = renderHook(() => useCreateOrder(onSubmit));

        await expect(result.current?.()).resolves.toEqual({ orderId: 'order-123' });
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    test('should reject when onSubmit rejects', async () => {
        const error = new Error('submit failed');
        const onSubmit = jest.fn().mockRejectedValue(error);

        const { result } = renderHook(() => useCreateOrder(onSubmit));

        await expect(result.current?.()).rejects.toThrow('submit failed');
    });
});
