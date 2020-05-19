/**
 * @desc - Centralised window.postMessage processing function used from Do3DS2Challenge, Get3DS2DeviceFingerprint and GetDevicefingerprint components
 *
 * @param domain {String} - expected domain for the postMesssage to have originated from
 * @param resolve {Function} - the resolve function from the Promise that called this function
 * @param reject {Function} - the reject function from the Promise that called this function
 * @param rejectObj {Object} - an object to reject the promise with if origins don't match
 * @param expectedType {String} - string to check that the passed data has the expected type
 *
 * @returns {function(*)}
 */
const getProcessMessageHandler = (
    domain: string,
    resolve: Function,
    reject: Function,
    rejectObj: object,
    expectedType: string
): Function => event => {
    const clonedRejectObj = { ...rejectObj };
    const origin = event.origin || event.originalEvent.origin;

    if (origin !== domain) {
        return 'Message was not sent from the expected domain';
    }

    if (typeof event.data !== 'string') {
        return 'Event data was not of type string';
    }

    if (!event.data.length) {
        return 'Invalid event data string';
    }

    // Try to parse the data
    try {
        const feedbackObj = JSON.parse(event.data);
        if (Object.prototype.hasOwnProperty.call(feedbackObj, 'type') && feedbackObj.type === expectedType) {
            resolve(feedbackObj);
        } else {
            return 'Event data was not of expected type';
        }
    } catch (e) {
        reject(clonedRejectObj);
        return false;
    }

    return true;
};

export default getProcessMessageHandler;
