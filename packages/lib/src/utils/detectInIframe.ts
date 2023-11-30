//TODO - rename this module to detectInIframeInSameDomain

// Returns true if the page is being run in an iframe (in a domain we have access to)
export default () => {
    if (window.parent.location instanceof Location) {
        return window.location !== window.parent.location;
    }
    return false; // we cannot access window.parent.location - so consider us "not to be in an iframe" for the purpose of Redirects
};
