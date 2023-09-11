// Returns true if the page is being run in an iframe
export default () => window.location !== window.parent.location;
