import { useCallback } from 'preact/hooks';

export const useCreateOrder = (onSubmit: () => Promise<string>) => {
    const createOrder = useCallback(async () => {
        const orderId = await onSubmit();
        return { orderId };
    }, [onSubmit]);

    return createOrder;
};
