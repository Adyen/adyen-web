import { AnalyticsEventClass } from './AnalyticsEventClass';
import { AnalyticsErrorEventObject } from './types';

export class AnalyticsErrorEvent extends AnalyticsEventClass {
    public component: string;
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
}
