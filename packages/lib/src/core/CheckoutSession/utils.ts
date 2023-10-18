import { CheckoutSession } from '../../types';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';

export function sanitizeSession(session): Partial<CheckoutSession> {
    if (!session || !session.id) {
        throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Invalid session');
    }

    const { shopperLocale, shopperEmail, telephoneNumber, id } = session;

    return {
        id,
        ...(session.sessionData ? { sessionData: session.sessionData } : {}),
        ...(shopperLocale && { shopperLocale }),
        ...(shopperEmail && { shopperEmail }),
        ...(telephoneNumber && { telephoneNumber })
    };
}
