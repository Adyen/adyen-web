import { AnalyticsObject, CreateAnalyticsObject } from './types';
import { ANALYTICS_ACTION_STR, ANALYTICS_SUBMIT_STR, ANALYTICS_VALIDATION_ERROR_STR } from './constants';

export const getUTCTimestamp = () => Date.now();

/**
 * All objects for the /checkoutanalytics endpoint have base props:
 *  "timestamp" & "component"
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
 * Info objects have, in addition to the base props:
 *   "type" & "target" &
 *   "isStoredPaymentMethod" & "brand" (when a storedCard is "selected")
 *   // TODO - NEW info events can also have validationErrorCode & validationErrorMessage props
 *
 *  All objects can also have a "metadata" object of key-value pairs
 */
export const createAnalyticsObject = (aObj: CreateAnalyticsObject): AnalyticsObject => ({
    timestamp: String(getUTCTimestamp()),
    component: aObj.component,
    ...(aObj.event === 'error' && { code: aObj.code, errorType: aObj.errorType }), // only added if we have an error object
    ...((aObj.event === 'error' || aObj.event === 'log') && { message: aObj.message }), // only added if we have an error, or log object
    ...(aObj.event === 'log' && { type: aObj.type }), // only added if we have a log object
    ...(aObj.event === 'log' && aObj.type === ANALYTICS_ACTION_STR && { subType: aObj.subtype }), // only added if we have a log object of Action type
    ...(aObj.event === 'log' && aObj.type === ANALYTICS_SUBMIT_STR && { target: aObj.target }), // only added if we have a log object of Submit type
    ...(aObj.event === 'info' && { type: aObj.type, target: aObj.target }), // only added if we have an info object
    ...(aObj.event === 'info' && aObj.isStoredPaymentMethod && { isStoredPaymentMethod: aObj.isStoredPaymentMethod, brand: aObj.brand }), // only added if we have an info object about a storedPM
    ...(aObj.event === 'info' &&
        aObj.type === ANALYTICS_VALIDATION_ERROR_STR && {
            validationErrorCode: aObj.validationErrorCode,
            validationErrorMessage: aObj.validationErrorMessage
        }),
    ...(aObj.metadata && { metadata: aObj.metadata })
});
