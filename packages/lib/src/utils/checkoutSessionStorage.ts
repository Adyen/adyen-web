const CHECKOUT_SESSION_KEY = 'AdyenCheckoutSession';

export const getStoredSession = () => {
    const storedSession = (window as any).localStorage.getItem(CHECKOUT_SESSION_KEY);
    if (!storedSession) return null;

    try {
        return JSON.parse(storedSession);
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const storeSession = session => {
    (window as any).localStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
    (window as any).localStorage.removeItem(CHECKOUT_SESSION_KEY);
};
