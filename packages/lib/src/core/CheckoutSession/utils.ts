import { CheckoutSession } from '../../types';

export function sanitizeSession(session): Partial<CheckoutSession> {
    if (!session || !session.id) throw new Error('Invalid session');

    return {
        id: session.id,
        ...(session.data ? { data: session.data } : {})
    };
}
