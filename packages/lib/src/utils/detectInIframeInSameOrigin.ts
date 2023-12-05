/**
 * Returns true if the page is being run in an iframe with the same origin as the parent.
 * In this scenario, if the merchant has set redirectFromTopWhenInIframe: true, then we can perform the redirect on the top level, parent, window;
 * rather than on the iframe's window
 */
export default () => {
    try {
        if (window.parent.location.href) {
            return window.location !== window.parent.location; // iframe check: locations will differ if we're in an iframe
        }
    } catch (e) {
        return false; // we cannot access window.parent.location.href - so consider us "not to be in an iframe" for the purpose of Redirects
    }
};
