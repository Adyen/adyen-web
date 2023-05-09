/**
 * Centralised window.postMessage processing function used in 3DS2 components and also by the deviceFingerprinting process
 * NOTE: this latter use case means that while the deviceFingerprinting is still completing this component is also listening to
 *  securedFields related postMessaging
 *
 * @param domain - expected domain for the postMesssage to have originated from
 * @param resolve - the resolve function from the Promise that called this function
 * @param reject - the reject function from the Promise that called this function
 * @param parseErrorObj - an error object to log in the case of unparseable data (albeit from a valid origin)
 * @param expectedType - string to check that the passed data has the expected type
 */
import { hasOwnProperty } from './hasOwnProperty';
import { PostMsgParseErrorObject } from '../components/ThreeDS2/types';

const getProcessMessageHandler =
    (domain: string, resolve: Function, reject: Function, expectedType: string): Function =>
    event => {
        const parseErrorObj: PostMsgParseErrorObject = {};
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
                // Silent fail - applies when RiskModule device fingerprinting is ongoing and this handler is picking up securedFields traffic
                return 'Event data was not of expected type';
            }
        } catch (e) {
            parseErrorObj.type = `${expectedType}-JSON-parse-error`;
            parseErrorObj.comment = 'failed to JSON parse event.data';
            parseErrorObj.extraInfo = `event.data = ${event.data}`;
            parseErrorObj.eventDataRaw = event.data;

            // Fail, almost silently. This particular case (un-parseable JSON from a trusted domain) was identified as a bug in corejs v3
            console.debug('get-process-message-handler::CATCH::Un-parseable JSON:: parseErrorObj=', parseErrorObj);

            return false;
        }

        return true;
    };

export default getProcessMessageHandler;
