import { AnalyticsObject } from './types';

export const getUTCTimestamp = () => Date.now();

/**
 * All objects for the /checkoutanalytics endpoint have base props:
 *  "timestamp" & "component"
 *
 * Error objects have, in addition to the base props:
 *  "code", "errorType" & "message"
 *
 * Log objects have, in addition to the base props:
 *  "type" & "message" (and maybe an "action")
 *
 * Event objects have, in addition to the base props:
 *   "type" & "target"
 */
export const createAnalyticsObject = (aObj): AnalyticsObject => ({
    timestamp: String(getUTCTimestamp()),
    component: aObj.component,
    ...(aObj.class === 'error' && { code: aObj.code, errorType: aObj.errorType }), // only added if we have an error object
    ...((aObj.class === 'error' || aObj.class === 'log') && { message: aObj.message }), // only added if we have an error or log object
    ...(aObj.class === 'log' && { type: aObj.type }), // only added if we have a log object
    ...(aObj.class === 'log' && aObj.action && { action: aObj.action }), // only added if we have a log object
    ...(aObj.class === 'event' && { type: aObj.type, target: aObj.target }) // only added if we have an event object
});
