import { AnalyticsObject, CreateAnalyticsObject } from './types';
import { ANALYTICS_ACTION_STR, ANALYTICS_VALIDATION_ERROR_STR } from './constants';
import uuid from '../../utils/uuid';

export const getUTCTimestamp = () => Date.now();

/**
 * All objects for the /checkoutanalytics endpoint have base props:
 *  "timestamp" & "component"
 *
 * Error objects have, in addition to the base props:
 *  "code", "errorType" & "message"
 *
 * Log objects have, in addition to the base props:
 *  "message" & "type" &
 *    "subtype" (e.g. when an action is handled)
 *
 * Info objects have, in addition to the base props:
 *   "type" & "target" &
 *     "isStoredPaymentMethod" & "brand" (when a storedCard is "selected"), or,
 *     "validationErrorCode" & "validationErrorMessage" (when the event is describing a validation error)
 *
 *  All objects can also have a "metadata" object of key-value pairs
 */
export const createAnalyticsObject = (aObj: CreateAnalyticsObject): AnalyticsObject => ({
    timestamp: String(getUTCTimestamp()),
    component: aObj.component,
    id: uuid(),
    /** ERROR */
    ...(aObj.event === 'error' && { code: aObj.code, errorType: aObj.errorType, message: aObj.message }), // error event
    /** LOG */
    ...(aObj.event === 'log' && { type: aObj.type, message: aObj.message }), // log event
    ...(aObj.event === 'log' && aObj.type === ANALYTICS_ACTION_STR && { subType: aObj.subtype }), // only added if we have a log event of Action type
    /** INFO */
    ...(aObj.event === 'info' && { type: aObj.type, target: aObj.target, issuer: aObj.issuer }), // info event
    ...(aObj.event === 'info' && aObj.isStoredPaymentMethod && { isStoredPaymentMethod: aObj.isStoredPaymentMethod, brand: aObj.brand }), // only added if we have an info event about a storedPM
    ...(aObj.event === 'info' &&
        aObj.type === ANALYTICS_VALIDATION_ERROR_STR && {
            validationErrorCode: aObj.validationErrorCode,
            validationErrorMessage: aObj.validationErrorMessage
        }), // only added if we have an info event describing a validation error
    /** All */
    ...(aObj.metadata && { metadata: aObj.metadata })
});
