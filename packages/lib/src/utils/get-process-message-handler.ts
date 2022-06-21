/**
 * Centralised window.postMessage processing function used in 3DS2 components and also by the deviceFingerprinting process
 * NOTE: this latter use case means that while the deviceFingerprinting is still completing this component is also listening to
 *  securedFields related postMessaging
 *
 * @param domain - expected domain for the postMesssage to have originated from
 * @param resolve - the resolve function from the Promise that called this function
 * @param reject - the reject function from the Promise that called this function
 * @param rejectObj - an object to reject the promise with if origins don't match
 * @param expectedType - string to check that the passed data has the expected type
 */
import { hasOwnProperty } from './hasOwnProperty';

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
        if (hasOwnProperty(feedbackObj, 'type') && feedbackObj.type === expectedType) {
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
