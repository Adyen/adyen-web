import { errorCodeMapping } from './constants';
import { digitsOnlyFormatter } from '../../utils/Formatters/formatters';
import { ERROR_FIELD_REQUIRED, ERROR_INVALID_FORMAT_EXPECTS } from '../Errors/constants';
import type { AnalyticsOptions } from './types';

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

export const processAnalyticsData = (analyticsData?: AnalyticsOptions['analyticsData']): AnalyticsOptions['analyticsData'] => {
    const ALLOWED_ANALYTICS_DATA: Array<keyof AnalyticsOptions['analyticsData']> = ['applicationInfo', 'checkoutAttemptId'];

    if (!analyticsData) return {};

    return ALLOWED_ANALYTICS_DATA.reduce<AnalyticsOptions['analyticsData']>((acc, prop) => {
        if (prop === 'applicationInfo') {
            if (analyticsData.applicationInfo !== undefined) acc.applicationInfo = analyticsData.applicationInfo;
            return acc;
        }

        if (prop === 'checkoutAttemptId') {
            if (analyticsData.checkoutAttemptId !== undefined) acc.checkoutAttemptId = analyticsData.checkoutAttemptId;
        }

        return acc;
    }, {});
};
