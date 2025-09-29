import { AnalyticsEvent } from './AnalyticsEvent';
import { ANALYTICS_EVENT, ANALYTICS_VALIDATION_ERROR_STR } from './constants';
import { mapErrorCodesForAnalytics } from './utils';

type AnalyticsInfoEventObject = {
    type: string;
    target?: string;
    issuer?: string;
    isExpress?: boolean;
    expressPage?: string;
    isStoredPaymentMethod?: boolean;
    brand?: string;
    validationErrorCode?: string;
    validationErrorMessage?: string;
    configData?: Record<string, string | boolean>;
    component?: string;
    cdnUrl?: string;
};

export enum InfoEventType {
    clicked = 'clicked',
    rendered = 'rendered',
    /**
     * Third party SDK events
     */
    sdkDownloadInitiated = 'sdkDownloadInitiated',
    sdkDownloadFailed = 'sdkDownloadFailed',
    sdkDownloadAborted = 'sdkDownloadAborted',
    sdkDownloadCompleted = 'sdkDownloadCompleted',
    Initialized = 'initialized',
    LookupStarted = 'lookupStarted',
    LookupUserNotFound = 'lookupUserNotFound',
    OtpStarted = 'otpStarted',
    OtpSucceeded = 'otpSucceeded',
    OtpCanceled = 'otpCanceled',
    OtpFailed = 'otpFailed',
    AddressSelectorClicked = 'addressSelectorClicked',
    AddressSelectorClosed = 'addressSelectorClosed',
    AddressChanged = 'addressChanged'
}

export class AnalyticsInfoEvent extends AnalyticsEvent {
    public type: string;
    public target: string;
    public issuer?: string;
    public isExpress?: boolean;
    public expressPage?: string;
    public isStoredPaymentMethod?: boolean;
    public brand?: string;
    public validationErrorCode?: string;
    public validationErrorMessage?: string;
    public configData?: Record<string, string | boolean>;

    /**
     *  Third party script URL's (e.g. Apple Pay)
     */
    public cdnUrl?: string;

    constructor(analyticsObject: AnalyticsInfoEventObject) {
        super();

        this.component = analyticsObject.component;

        this.type = analyticsObject.type;
        this.target = analyticsObject.target;
        this.issuer = analyticsObject.issuer;
        this.isExpress = analyticsObject.isExpress;
        this.isStoredPaymentMethod = analyticsObject.isStoredPaymentMethod;
        this.isExpress = analyticsObject.isExpress;
        this.expressPage = analyticsObject.expressPage;
        this.brand = analyticsObject.brand;
        this.validationErrorCode = analyticsObject.validationErrorCode;
        this.validationErrorMessage = analyticsObject.validationErrorMessage;
        this.configData = analyticsObject.configData;

        this.cdnUrl = analyticsObject.cdnUrl;

        // Some of the more generic validation error codes required combination with target to retrieve a specific code
        if (this.type === ANALYTICS_VALIDATION_ERROR_STR) {
            this.validationErrorCode = mapErrorCodesForAnalytics(this.validationErrorCode, this.target);
        }

        return this;
    }

    public getEventCategory(): string {
        return ANALYTICS_EVENT.info;
    }
}
