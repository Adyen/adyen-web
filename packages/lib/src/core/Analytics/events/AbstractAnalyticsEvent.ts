import uuid from '../../../utils/uuid';

export abstract class AbstractAnalyticsEvent {
    private readonly timestamp: string;
    private readonly id: string;

    /**
     * Component tx variant or identifier
     * @private
     */
    private readonly component: string;

    public abstract getEventCategory(): string;

    protected constructor(component: string) {
        this.component = component;
        this.id = uuid();
        this.timestamp = String(Date.now());
    }
}
