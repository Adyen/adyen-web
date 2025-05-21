import { AnalyticsEventClass } from './AnalyticsEventClass';
import { AnalyticsLogEventObject } from './types';

export class AnalyticsLogEvent extends AnalyticsEventClass {
    public type: string;
    public message?: string;
    public subType?: string;
    public result?: string;
    public target?: string; // is this ever used?

    constructor(analyticsObject: AnalyticsLogEventObject) {
        super();

        this.type = analyticsObject.type;
        this.message = analyticsObject.message;
        this.subType = analyticsObject.type;
        this.result = analyticsObject.result;
        this.target = analyticsObject.target;

        return this;
    }
}
