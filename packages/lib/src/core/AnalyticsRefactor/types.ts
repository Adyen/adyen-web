const INFO_TYPE = {
    selected: 'selected',
    focus: 'focus',
    unfocus: 'unfocus',
    validationError: 'validationError',
    rendered: 'rendered',
    configured: 'configured',
    displayed: 'displayed'
} as const;

const LOG_TYPE = {
    action: 'action',
    submit: 'submit',
    redirect: 'redirect',
    threeDS2: 'threeDS2'
} as const;

const LOG_SUB_TYPE = {
    threeDS2: 'threeDS2',
    redirect: 'redirect',
    voucher: 'voucher',
    await: 'await',
    qrCode: 'qrCode',
    bankTransfer: 'bankTransfer',
    sdk: 'sdk',
    fingerprintDataSentWeb: 'fingerprintDataSentWeb',
    fingerprintDataSentMobile: 'fingerprintDataSentMobile',
    fingerprintIframeLoaded: 'fingerprintIframeLoaded',
    fingerprintCompleted: 'fingerprintCompleted',
    challengeDataSentWeb: 'challengeDataSentWeb',
    challengeDataSentMobile: 'challengeDataSentMobile',
    challengeIframeLoaded: 'challengeIframeLoaded',
    challengeDisplayed: 'challengeDisplayed',
    challengeCompleted: 'challengeCompleted'
} as const;

const ERROR_TYPE = {
    network: 'Network',
    implementation: 'Implementation',
    internal: 'Internal',
    apiError: 'ApiError',
    sdkError: 'SdkError',
    thirdParty: 'ThirdParty',
    generic: 'Generic',
    redirect: 'Redirect',
    threeDS2: 'ThreeDS2'
} as const;

export type InfoType = (typeof INFO_TYPE)[keyof typeof INFO_TYPE];
export type LogType = (typeof LOG_TYPE)[keyof typeof LOG_TYPE];
export type LogSubType = (typeof LOG_SUB_TYPE)[keyof typeof LOG_SUB_TYPE];
export type ErrorType = (typeof ERROR_TYPE)[keyof typeof ERROR_TYPE];

export interface IEvent {
    timestamp: string;
    component: string;
    id: string;
    metadata?: Record<string, object>;
}

export interface IInfoEvent extends IEvent {
    type: InfoType;
    isStoredPaymentMethod?: boolean;
    brand?: string;
    validationErrorCode?: string;
    validationErrorMessage?: string;
    issuer?: string;
    configData?: Record<string, string | boolean>;
    /* Internal todo: put those somewhere else */
    isExpress?: boolean;
    expressPage?: string;
}

export interface ILogEvent extends IEvent {
    type: LogType;
    subType?: LogSubType;
    target?: string;
    message?: string;
    result?: string;
}

export interface IErrorEvent extends IEvent {
    errorType: ErrorType;
    code?: string;
    target?: string;
    message?: string;
}

export type AnalyticEventType = 'error' | 'log' | 'info';
