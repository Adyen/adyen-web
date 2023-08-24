import { AnalyticsObject, CreateAnalyticsObject } from './types';
import { ANALYTICS_ACTION_STR, ANALYTICS_SUBMIT_STR } from './constants';

export const getUTCTimestamp = () => Date.now();

/**
 * All objects for the /checkoutanalytics endpoint have base props:
 *  "timestamp" & "component" (and an optional "metadata" object of key-value pairs)
 *
 * Error objects have, in addition to the base props:
 *  "code", "errorType" & "message"
 *
 * Log objects have, in addition to the base props:
 *  "message" &
 *  "type" & "target" (e.g. when onSubmit is called after a pay button click), or,
 *  "type" & "subtype" (e.g. when an action is handled), or,
 *  "type" (e.g. logging during the 3DS2 process)
 *
 * Event objects have, in addition to the base props:
 *   "type" & "target"
 */
export const createAnalyticsObject = (aObj: CreateAnalyticsObject): AnalyticsObject => ({
    timestamp: String(getUTCTimestamp()),
    component: aObj.component,
    ...(aObj.action === 'error' && { code: aObj.code, errorType: aObj.errorType }), // only added if we have an error object
    ...((aObj.action === 'error' || aObj.action === 'log') && { message: aObj.message }), // only added if we have an error, or log object
    ...(aObj.action === 'log' && { type: aObj.type }), // only added if we have a log object
    ...(aObj.action === 'log' && aObj.type === ANALYTICS_ACTION_STR && { subType: aObj.subtype }), // only added if we have a log object of Action type
    ...(aObj.action === 'log' && aObj.type === ANALYTICS_SUBMIT_STR && { target: aObj.target }), // only added if we have a log object of Submit type
    ...(aObj.action === 'event' && { type: aObj.type, target: aObj.target }) // only added if we have an event object
});
