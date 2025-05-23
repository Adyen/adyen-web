import { AnalyticsEvent } from './AnalyticsEvent';
import { ANALYTICS_EVENT } from './constants';

type AnalyticsErrorEventObject = {
    code?: string;
    errorType?: string;
    message?: string;
    component?: string;
};

export class AnalyticsErrorEvent extends AnalyticsEvent {
    public code?: string;
    public errorType?: string;
    public message?: string;

    constructor(analyticsObject: AnalyticsErrorEventObject) {
        super();

        this.code = analyticsObject.code;
        this.errorType = analyticsObject.errorType;
        this.message = analyticsObject.message;
        this.component = analyticsObject.component;

        return this;
    }

    public getEventCategory(): string {
        return ANALYTICS_EVENT.error;
    }
}
