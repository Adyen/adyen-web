export const RISK_DATA_VERSION = '1.0.0';
export const DF_VERSION = '1.0.0';

export const DEVICE_FINGERPRINT = 'deviceFingerprint';
export const DF_TIMEOUT = 20000;

export const FAILED_DFP_RESOLVE_OBJECT_TIMEOUT = {
    result: {
        type: DEVICE_FINGERPRINT,
        value: 'df-timedOut'
    },
    errorCode: 'timeout'
};

export const ERRORS = {
    TIME_OUT: 'timeout',
    WRONG_ORIGIN: 'wrongOrigin',
    WRONG_DATA_TYPE: 'wrongDataType',
    MISSING_PROPERTY: 'missingProperty',
    UNKNOWN: 'unknownError'
};

export const ERROR_MESSAGES = {
    timeout: 'iframe loading timed out',
    wrongOrigin: 'Result did not come from the expected origin',
    wrongDataType: 'Result data was not of the expected type',
    missingProperty: 'Result data did not contain the expected properties',
    unknownError: 'An unknown error occurred'
};
