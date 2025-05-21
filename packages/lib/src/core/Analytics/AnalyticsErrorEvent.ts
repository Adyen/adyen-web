import { AnalyticsEventClass } from './AnalyticsEventClass';
import { AnalyticsErrorEventObject } from './types';

export class AnalyticsErrorEvent extends AnalyticsEventClass {
    public code?: string;
    public errorType?: string;
    public message?: string;

    constructor(analyticsObject: AnalyticsErrorEventObject) {
        super();

        this.code = analyticsObject.code;
        this.errorType = analyticsObject.errorType;
        this.message = analyticsObject.message;

        return this;
    }
}
