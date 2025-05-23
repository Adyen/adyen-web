import { AnalyticsEvent } from './AnalyticsEvent';
import { ANALYTICS_EVENT } from './constants';

type AnalyticsLogEventObject = {
    type?: string;
    message?: string;
    subType?: string;
    result?: string;
    component?: string;
    target?: string; // is this ever used?
};

export class AnalyticsLogEvent extends AnalyticsEvent {
    public type: string;
    public message?: string;
    public subType?: string;
    public result?: string;
    public target?: string; // is this ever used?

    constructor(analyticsObject: AnalyticsLogEventObject) {
        super();

        this.type = analyticsObject.type;
        this.message = analyticsObject.message;
        this.subType = analyticsObject.subType;
        this.result = analyticsObject.result;
        this.target = analyticsObject.target;
        this.component = analyticsObject.component;

        return this;
    }

    public getEventCategory(): string {
        return ANALYTICS_EVENT.log;
    }
}
