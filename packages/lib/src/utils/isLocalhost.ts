/**
 * Detects whether the current page is running on localhost
 *
 * @returns true when the page hostname is 'localhost' or a loopback IP address
 */
const isLocalhost = (): boolean => {
    const hostname = globalThis.location?.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
};

export default isLocalhost;
