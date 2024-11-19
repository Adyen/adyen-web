import { ErrorEvent, Event, InfoEvent, LogEvent } from './Event';
import { AnalyticsProps } from '../Analytics/types';
import { AnalyticEventType, IErrorEvent, IEvent, IInfoEvent, ILogEvent } from './types';
import { EventsQueue } from './EventsQueue';

// Singleton class
export class AnalyticsManager {
    private static defaultProps = {
        enabled: true,
        analyticsData: {}
    };
    private attemptId: string;
    private props: AnalyticsProps;
    private static instance: AnalyticsManager;
    private logQueue: EventsQueue<LogEvent>;
    private errorQueue: EventsQueue<ErrorEvent>;
    private infoQueue: EventsQueue<InfoEvent>;

    public static getAnalyticsManager(props: AnalyticsProps): AnalyticsManager {
        if (!AnalyticsManager.instance) {
            AnalyticsManager.instance = new AnalyticsManager(props);
        }
        return AnalyticsManager.instance;
    }

    public track(eventType: AnalyticEventType, payload) {
        const event = this.createEvent(eventType, payload);
        this.add(event);
    }

    private createEvent<P>(eventType: AnalyticEventType, payload: P) {
        switch (eventType) {
            case 'error':
                return new ErrorEvent(payload as IErrorEvent);
            case 'log':
                return new LogEvent(payload as ILogEvent);
            case 'info':
                return new InfoEvent(payload as IInfoEvent);
            default:
                throw new Error('Invalid event type');
        }
    }

    private constructor(props: AnalyticsProps) {
        this.props = { ...AnalyticsManager.defaultProps, ...props };
        this.logQueue = new EventsQueue<LogEvent>({ maxLength: 10, debounceTime: 0 }); // todo: check it
        this.errorQueue = new EventsQueue<ErrorEvent>({ maxLength: 1, debounceTime: 0 }); // todo: check it
        this.infoQueue = new EventsQueue<InfoEvent>({ maxLength: 10, debounceTime: 0 }); // todo: check it
        void this.setUpWhenNeeded();
    }

    private async setUpWhenNeeded() {
        // fetch the attemptId
        try {
            const { enabled } = this.props;
            if (!this.attemptId) {
                const level = enabled ? 'all' : 'initial';
                this.attemptId = await Promise.resolve('');
            }
        } catch (e: any) {
            console.warn(`Fetching checkoutAttemptId failed.${e ? ` Error=${e}` : ''}`);
        }
    }

    private add(event: Event<IEvent>) {
        if (event instanceof LogEvent) {
            this.logQueue.push(event);
        } else if (event instanceof ErrorEvent) {
            this.errorQueue.push(event);
        } else if (event instanceof InfoEvent) {
            this.infoQueue.push(event);
        }
    }

    private send() {
        // to be refined
    }
}
