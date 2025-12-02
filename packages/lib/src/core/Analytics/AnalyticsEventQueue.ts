import { AbstractAnalyticsEvent, AnalyticsEventCategory } from './events/AbstractAnalyticsEvent';

class AnalyticsEventQueue {
    private info: AbstractAnalyticsEvent[] = [];
    private errors: AbstractAnalyticsEvent[] = [];
    private logs: AbstractAnalyticsEvent[] = [];

    public add(event: AbstractAnalyticsEvent) {
        const category = event.getEventCategory();

        if (category === AnalyticsEventCategory.info) this.info.push(event);
        if (category === AnalyticsEventCategory.error) this.errors.push(event);
        if (category === AnalyticsEventCategory.log) this.logs.push(event);
    }

    public get infoEvents(): AbstractAnalyticsEvent[] {
        return this.info;
    }

    public get errorEvents(): AbstractAnalyticsEvent[] {
        return this.errors;
    }

    public get logEvents(): AbstractAnalyticsEvent[] {
        return this.logs;
    }

    public clear(): void {
        this.info = [];
        this.errors = [];
        this.logs = [];
    }
}

export { AnalyticsEventQueue };
