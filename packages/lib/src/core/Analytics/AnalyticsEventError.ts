import { AnalyticsEventClass } from './AnalyticsEventClass';

export class AnalyticsEventError extends AnalyticsEventClass {
    public code?: string;
    public errorType?: string;
    public message?: string;

    constructor(analyticsObject: any) {
        super();

        this.code = analyticsObject.code;
        this.errorType = analyticsObject.errorType;
        this.message = analyticsObject.message;

        return this;
    }
}
