/**
 * Centralised window.postMessage processing function used in 3DS2 components and *also* by the RiskModule's device fingerprinting process
 * NOTE: this latter use case means that while the deviceFingerprinting is still completing this component is also listening to
 *  securedFields related postMessaging
 *
 * @param domain - expected domain for the postMesssage to have originated from
 * @param resolve - the resolve function from the Promise that called this function
 * @param reject - the reject function from the Promise that called this function
 * @param parseErrorObj - an error object to log in the case of unparseable data (albeit from a valid origin)
 * @param expectedType - string to check that the message event's data has the expected type
 */
import { hasOwnProperty } from './hasOwnProperty';
import { PostMsgParseErrorObject } from '../components/ThreeDS2/types';

const getProcessMessageHandler =
    (domain: string, resolve: Function, reject: Function, expectedType: string): Function =>
    (event: MessageEvent): string | boolean => {
        const parseErrorObj: PostMsgParseErrorObject = {};
        const origin = event.origin;

        // console.log('\n### get-process-message-handler::event:: ', event);
        // console.log('### get-process-message-handler:: event.origin:: ', origin);
        // console.log('### get-process-message-handler:: expected domain:: ', domain);

        if (origin !== domain) {
            // FAIL SILENTLY: if it's not from the expected domain then it's not our traffic
            return 'Message was not sent from the expected domain';
        }

        /**
         *  At this point we know the message is from the expected domain
         *  - so is presumably "our" traffic and not random messages from the merchant's site, the build process, or from the browser (or extensions)
         *  // TODO - Do more here in terms of logging to help debug issues with 3DS2
         */

        if (typeof event.data !== 'string') {
            // If it's from our domain but not a string - log this somewhere?
            // console.log('### get-process-message-handler:: Event data from expected domain but not in expected form');
            return 'Event data was not of type string'; // "Event data from expected domain but not in expected form"
        }

        if (!event.data.length) {
            // If it's from our domain, is a string, but is empty - log this somewhere?
            // console.log('### get-process-message-handler:: Event data from expected domain, in expected form, but empty');
            return 'Invalid event data string'; //  "Event data from expected domain, in expected form, but empty"
        }

        // Try to parse the data
        try {
            const feedbackObj = JSON.parse(event.data);

            if (hasOwnProperty(feedbackObj, 'type')) {
                if (feedbackObj.type === expectedType) {
                    // Happy flow
                    resolve(feedbackObj);
                    return true;
                } else {
                    // event.data has 'type' but not what we were expecting
                    // console.log(
                    //     '### get-process-message-handler:::: feedbackObj.type was not of expected type',
                    //     feedbackObj.type,
                    //     '!=',
                    //     expectedType
                    // );
                    return 'Event data was not of expected type';
                }
            } else {
                // FAIL SILENTLY: event.data had no 'type' property
                //  example: applies when RiskModule device fingerprinting is ongoing and this handler is picking up securedFields traffic
                // console.log('### get-process-message-handler:::: returned data had no type property feedbackObj=', feedbackObj);
                return 'Event data had no type';
            }
        } catch (e) {
            parseErrorObj.type = `${expectedType}-JSON-parse-error`;
            parseErrorObj.comment = 'failed to JSON parse event.data';
            parseErrorObj.extraInfo = `event.data = ${event.data}`;
            parseErrorObj.eventDataRaw = event.data;

            // TODO - decide whether to console.log/debug/error &/or call the merchant defined onError callback
            console.debug('get-process-message-handler::CATCH::Un-parseable JSON:: parseErrorObj=', parseErrorObj);

            return false;
        }
    };

export default getProcessMessageHandler;
