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
    subtype?: InfoEventSubtypes;
};

export enum InfoEventTypes {
    clicked = 'clicked',
    rendered = 'rendered',
    ThirdPartySdk = 'ThirdPartySDK'
}

export enum InfoEventSubtypes {
    Initialized = 'Initialized',
    LookupStarted = 'LookupStarted',
    LookupUserNotFound = 'LookupUserNotFound',
    OtpStarted = 'OtpStarted',
    OtpSucceeded = 'OtpSucceeded',
    OtpCanceled = 'OtpCanceled',
    OtpFailed = 'OtpFailed',
    AddressSelectorClicked = 'AddressSelectorClicked',
    AddressChanged = 'AddressChanged'
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

    public subtype?: InfoEventSubtypes;

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

        this.subtype = analyticsObject.subtype;

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
