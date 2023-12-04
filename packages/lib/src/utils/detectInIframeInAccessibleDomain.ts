// Returns true if the page is being run in an iframe (in a domain we have access to)
export default () => {
    try {
        if (window.parent.location.href) {
            return window.location !== window.parent.location; // iframe check: locations will differ if we're in an iframe
        }
    } catch (e) {
        return false; // we cannot access window.parent.location.href - so consider us "not to be in an iframe" for the purpose of Redirects
    }
};
