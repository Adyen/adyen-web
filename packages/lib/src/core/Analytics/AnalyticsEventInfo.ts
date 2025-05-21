import { AnalyticsEventClass } from './AnalyticsEventClass';
// import { AnalyticsEventObject } from './types';

export class AnalyticsEventInfo extends AnalyticsEventClass {
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

    constructor(analyticsObject: any) {
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

        return this;
    }
}
