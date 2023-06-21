import { AnalyticsObject } from './types';
import { ANALYTICS_ACTION_STR, ANALYTICS_SUBMIT_STR } from './constants';

export const getUTCTimestamp = () => Date.now();

/**
 * All objects for the /checkoutanalytics endpoint have base props:
 *  "timestamp" & "component"
 *
 * Error objects have, in addition to the base props:
 *  "code", "errorType" & "message"
 *
 * Log objects have, in addition to the base props:
 *  "type" & "message" (and maybe an "action" & "subtype")
 *
 * Event objects have, in addition to the base props:
 *   "type" & "target"
 */
export const createAnalyticsObject = (aObj): AnalyticsObject => ({
    timestamp: String(getUTCTimestamp()),
    component: aObj.component,
    ...(aObj.class === 'error' && { code: aObj.code, errorType: aObj.errorType }), // only added if we have an error object
    ...((aObj.class === 'error' || (aObj.class === 'log' && aObj.type !== ANALYTICS_SUBMIT_STR)) && { message: aObj.message }), // only added if we have an error, or log object (that's not logging a submit/pay button press)
    ...(aObj.class === 'log' && { type: aObj.type }), // only added if we have a log object
    ...(aObj.class === 'log' && aObj.type === ANALYTICS_ACTION_STR && { subType: aObj.subtype }), // only added if we have a log object of Action type
    ...(aObj.class === 'log' && aObj.type === ANALYTICS_SUBMIT_STR && { target: aObj.target }), // only added if we have a log object of Submit type
    ...(aObj.class === 'event' && { type: aObj.type, target: aObj.target }) // only added if we have an event object
});
