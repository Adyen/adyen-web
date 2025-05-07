import {
    AnalyticsData,
    CreateNewAnalyticsEventObject,
    EnhancedAnalyticsObject,
    NewAnalyticsEventObjectInfo,
    NewAnalyticsEventObjectLog,
    NewAnalyticsEventObjectError
} from './types';
import { errorCodeMapping, ALLOWED_ANALYTICS_DATA, ANALYTICS_EVENT } from './constants';
import uuid from '../../utils/uuid';
import { digitsOnlyFormatter } from '../../utils/Formatters/formatters';
import { ERROR_FIELD_REQUIRED, ERROR_INVALID_FORMAT_EXPECTS } from '../Errors/constants';

export const getUTCTimestamp = () => Date.now();

const INVALID_INFO_PROPS = ['code', 'errorType', 'message', 'result', 'subType'];
const INVALID_ERROR_PROPS = [
    'brand',
    'configData',
    'expressPage',
    'isExpress',
    'isStoredPaymentMethod',
    'issuer',
    'result',
    'subType',
    'target',
    'type',
    'validationErrorCode',
    'validationErrorMessage'
];
const INVALID_LOG_PROPS = [
    'brand',
    'code',
    'configData',
    'errorType',
    'expressPage',
    'isExpress',
    'isStoredPaymentMethod',
    'issuer',
    'validationErrorCode',
    'validationErrorMessage'
];

export const createNewAnalyticsEvent = (aObj: CreateNewAnalyticsEventObject): EnhancedAnalyticsObject => {
    /**
     * Create warnings if props that aren't allowed have been defined for specific analytics event.
     * If these props are defined the call to the analytics endpoint will fail, although this isn't a payment critical error, hence we only warn.
     */
    if (aObj.category === ANALYTICS_EVENT.info) {
        const inValidProps = isValidEventObject(aObj, INVALID_INFO_PROPS);
        if (inValidProps.length) {
            console.warn('You are trying to create an Info analytics event with unsupported props. Namely: ', inValidProps);
        }
    }

    if (aObj.category === ANALYTICS_EVENT.log) {
        const inValidProps = isValidEventObject(aObj, INVALID_LOG_PROPS);
        if (inValidProps.length) {
            console.warn('You are trying to create an Log analytics event with unsupported props. Namely: ', inValidProps);
        }
    }

    if (aObj.category === ANALYTICS_EVENT.error) {
        const inValidProps = isValidEventObject(aObj, INVALID_ERROR_PROPS);
        if (inValidProps.length) {
            console.warn('You are trying to create an Error analytics event with unsupported props. Namely: ', inValidProps);
        }
    }

    return {
        timestamp: String(getUTCTimestamp()),
        id: uuid(),
        ...aObj
    } as EnhancedAnalyticsObject;
};

// Guard to ensure certain props are NOT set on an analytics event
const isValidEventObject = (
    obj: NewAnalyticsEventObjectInfo | NewAnalyticsEventObjectLog | NewAnalyticsEventObjectError,
    inValidPropsToCheckArr: string[]
): string[] => {
    // If any of the invalid props are present, push them into a new array
    return inValidPropsToCheckArr.reduce((acc, item) => {
        if (obj[item] !== undefined) {
            acc.push(item);
        }
        return acc;
    }, []);
};

export const mapErrorCodesForAnalytics = (errorCode: string, target: string) => {
    // Some of the more generic error codes required combination with target to retrieve a specific code
    if (errorCode === ERROR_FIELD_REQUIRED || errorCode === ERROR_INVALID_FORMAT_EXPECTS) {
        return errorCodeMapping[`${errorCode}.${target}`] ?? errorCode;
    }

    let errCode = errorCodeMapping[errorCode] ?? errorCode;

    // If errCode isn't now a number - then we just need to remove any non-digits
    // since the correct error code is already contained within the string e.g. securedField related errors
    if (isNaN(Number(errCode))) {
        errCode = digitsOnlyFormatter(errCode);
    }

    return errCode;
};

export const processAnalyticsData = (analyticsData: AnalyticsData): AnalyticsData => {
    return Object.keys(analyticsData).reduce((acc, prop) => {
        if (ALLOWED_ANALYTICS_DATA.includes(prop)) acc[prop] = analyticsData[prop];
        return acc;
    }, {});
};
