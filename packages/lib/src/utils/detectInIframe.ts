/**
 * Returns true if the Checkout is hosted within an iframe, false otherwise.
 */
const detectInIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return false;
    }
};

export { detectInIframe };
