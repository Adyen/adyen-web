import { ThreeDS2FlowObject } from './types';

export const DEFAULT_CHALLENGE_WINDOW_SIZE = '02';

export const THREEDS_METHOD_TIMEOUT = 10000;
export const CHALLENGE_TIMEOUT = 600000;

export const CHALLENGE_TIMEOUT_REJECT_OBJECT: ThreeDS2FlowObject = {
    result: {
        transStatus: 'U'
    },
    type: 'challengeResult',
    errorCode: 'timeout'
};

export const FAILED_METHOD_STATUS_RESOLVE_OBJECT: ThreeDS2FlowObject = {
    result: {
        threeDSCompInd: 'N'
    },
    type: 'fingerPrintResult'
};

export const FAILED_METHOD_STATUS_RESOLVE_OBJECT_TIMEOUT: ThreeDS2FlowObject = {
    result: {
        threeDSCompInd: 'N'
    },
    type: 'fingerPrintResult',
    errorCode: 'timeout'
};

export const ERRORS = {
    TIME_OUT: 'timeout',
    WRONG_ORIGIN: 'wrongOrigin',
    HTML_ELEMENT: 'HTMLElementError',
    WRONG_DATA_TYPE: 'wrongDataType',
    MISSING_PROPERTY: 'missingProperty',
    UNKNOWN: 'unknownError'
};

export const ERROR_MESSAGES = {
    timeout: 'ThreeDS2 timed out',
    wrongOrigin: 'Result came in the right format but not from the expected origin',
    HTMLElementError: 'No proper HTML element was passed',
    wrongDataType: 'Result data was not of the expected type',
    missingProperty: 'Result data did not contain the expected properties',
    unknownError: 'An unknown error occurred'
};

// Re. EMV 3-D Specification: EMVCo_3DS_Spec_210_1017.pdf
export const CHALLENGE_WINDOW_SIZES = {
    '01': ['250px', '400px'],
    '02': ['390px', '400px'],
    '03': ['500px', '600px'],
    '04': ['600px', '400px'],
    '05': ['100%', '100%']
};
