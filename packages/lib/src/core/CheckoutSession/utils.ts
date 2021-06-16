import { CheckoutSession } from '../../types';

export function sanitizeSession(session): CheckoutSession {
    if (!session || !session.id || !session.data) throw new Error('Invalid session');

    return {
        id: session.id,
        data: session.data
    };
}
