import uuid from '../../utils/uuid';
import { getUTCTimestamp } from './utils';

export abstract class AnalyticsEvent {
    public timestamp: string;
    public id: string;
    public component: string;

    public abstract getEventCategory(): string;

    constructor() {
        this.id = uuid();
        this.timestamp = String(getUTCTimestamp());
    }
}
