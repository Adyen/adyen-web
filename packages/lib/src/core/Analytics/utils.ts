import { AnalyticsData, AnalyticsObject, CreateAnalyticsObject } from './types';
import { ANALYTICS_ACTION_STR, ANALYTICS_VALIDATION_ERROR_STR, ALLOWED_ANALYTICS_DATA, errorCodeMapping } from './constants';
import uuid from '../../utils/uuid';
import { ERROR_CODES, ERROR_MSG_INCOMPLETE_FIELD } from '../Errors/constants';
import { DEFAULT_CHALLENGE_WINDOW_SIZE, THREEDS2_FULL } from '../../components/ThreeDS2/config';
import { CardElementProps } from '../../components/Card/types';
import CardDefaultProps from '../../components/Card/components/CardInput/defaultProps';

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
    ...(aObj.event === 'log' && (aObj.type === ANALYTICS_ACTION_STR || aObj.type === THREEDS2_FULL) && { subType: aObj.subtype }), // only added if we have a log event of Action type or ThreeDS2
    ...(aObj.event === 'log' && aObj.type === THREEDS2_FULL && { result: aObj.result }), // only added if we have a log event ThreeDS2 type
    /** INFO */
    ...(aObj.event === 'info' && { type: aObj.type, target: aObj.target }), // info event
    ...(aObj.event === 'info' && aObj.issuer && { issuer: aObj.issuer }), // relates to issuerLists
    ...(aObj.event === 'info' && { isExpress: aObj.isExpress, expressPage: aObj.expressPage }), // relates to Plugins & detecting Express PMs
    ...(aObj.event === 'info' && aObj.isStoredPaymentMethod && { isStoredPaymentMethod: aObj.isStoredPaymentMethod, brand: aObj.brand }), // only added if we have an info event about a storedPM
    ...(aObj.event === 'info' &&
        aObj.type === ANALYTICS_VALIDATION_ERROR_STR && {
            validationErrorCode: mapErrorCodesForAnalytics(aObj.validationErrorCode, aObj.target),
            validationErrorMessage: aObj.validationErrorMessage
        }), // only added if we have an info event describing a validation error
    /** All */
    ...(aObj.metadata && { metadata: aObj.metadata })
});

const mapErrorCodesForAnalytics = (errorCode: string, target: string) => {
    // Some of the more generic error codes required combination with target to retrieve a specific code
    if (errorCode === ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD] || errorCode === 'invalidFormatExpects') {
        return errorCodeMapping[`${errorCode}.${target}`] ?? errorCode;
    }

    return errorCodeMapping[errorCode] ?? errorCode;
};

export const processAnalyticsData = (analyticsData: AnalyticsData): AnalyticsData => {
    return Object.keys(analyticsData).reduce((acc, prop) => {
        if (ALLOWED_ANALYTICS_DATA.includes(prop)) acc[prop] = analyticsData[prop];
        return acc;
    }, {});
};

export const getCardConfigData = (cardProps: CardElementProps) => {
    // Extract props from cardProps - mostly setting a default value, if prop not found
    const {
        autoFocus = CardDefaultProps.autoFocus,
        billingAddressAllowedCountries = [],
        billingAddressMode = cardProps.onAddressLookup ? 'lookup' : CardDefaultProps.billingAddressMode,
        billingAddressRequired = CardDefaultProps.billingAddressRequired,
        brands,
        challengeWindowSize = DEFAULT_CHALLENGE_WINDOW_SIZE,
        styles
    } = cardProps;

    let hasBrands: true | 'default' | 'single' = true;
    if (!brands) {
        hasBrands = 'default';
    } else if (brands.length === 1) {
        hasBrands = 'single';
    }

    const configData = {
        autoFocus,
        ...(billingAddressRequired ? { billingAddressAllowedCountries } : { billingAddressAllowedCountries: 'none' }),
        ...(billingAddressRequired ? { billingAddressMode } : { billingAddressMode: 'none' }),
        billingAddressRequired,
        // billingAddressRequiredFields,
        // brands, // TODO might just want to know if the array is filled, and if so, whether it has more than 1 item
        brands: hasBrands,
        challengeWindowSize,
        isStylesConfigured: !!styles
    };

    console.log('### utils::getCardConfigData::configData ', configData);

    return configData;
};
