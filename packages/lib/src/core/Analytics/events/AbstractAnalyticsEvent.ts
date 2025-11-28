import uuid from '../../../utils/uuid';

export enum AnalyticsEventCategory {
    info = 'info',
    error = 'error',
    log = 'log'
}

export abstract class AbstractAnalyticsEvent {
    private readonly timestamp: string;
    private readonly id: string;

    /**
     * Component tx variant or identifier
     * @private
     */
    private readonly component: string;

    public abstract getEventCategory(): AnalyticsEventCategory;

    protected constructor(component: string) {
        this.component = component;
        this.id = uuid();
        this.timestamp = String(Date.now());
    }
}
