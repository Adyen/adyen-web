import { CheckoutSession } from '../../types';

export function sanitizeSession(session): Partial<CheckoutSession> {
    if (!session || !session.id) throw new Error('Invalid session');

    return {
        id: session.id,
        ...(session.sessionData ? { sessionData: session.sessionData } : {})
    };
}
