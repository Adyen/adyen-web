import { AnalyticsEvent } from './AnalyticsEvent';
import { ANALYTICS_VALIDATION_ERROR_STR } from './constants';
import { mapErrorCodesForAnalytics } from './utils';
import { AnalyticsInfoEventObject } from './types';

export class AnalyticsInfoEvent extends AnalyticsEvent {
    public type: string;
    public target: string;
    public component: string;
    public issuer?: string;
    public isExpress?: boolean;
    public expressPage?: string;
    public isStoredPaymentMethod?: boolean;
    public brand?: string;
    public validationErrorCode?: string;
    public validationErrorMessage?: string;
    public configData?: Record<string, string | boolean>;

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

        // Some of the more generic validation error codes required combination with target to retrieve a specific code
        if (this.type === ANALYTICS_VALIDATION_ERROR_STR) {
            this.validationErrorCode = mapErrorCodesForAnalytics(this.validationErrorCode, this.target);
        }

        return this;
    }
}
