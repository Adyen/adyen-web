/**
 * Returns true if the Checkout is hosted within an iframe, false otherwise.
 */
const detectInIframe = () => {
    if (typeof window !== 'undefined') {
        try {
            return window.self !== window.top;
        } catch (e) {
            // In some cross-origin scenarios, accessing window.top might throw an error.
            // In such cases, it is likely in an iframe.
            return true;
        }
    } else {
        // SSR
        return false;
    }
};

export { detectInIframe };
