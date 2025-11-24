import CollectId, { AttemptIdPayload } from '../Services/analytics/collect-id';
import EventsQueue, { EventsQueueModule } from './EventsQueue';
import { ANALYTICS_PATH } from './constants';
import { debounce } from '../../utils/debounce';
import { processAnalyticsData } from './utils';
import { AbstractAnalyticsEvent } from './events/AbstractAnalyticsEvent';
import Storage from '../../utils/Storage';
import type { CheckoutAttemptIdSessionStorage } from '../Services/analytics/types';
import type { AnalyticsOptions } from './types';

/**
 * If the checkout attempt ID was stored more than fifteen minutes ago, then we should request a new ID.
 * More here: COWEB-1099
 */
function isSessionCreatedUnderFifteenMinutes(session: CheckoutAttemptIdSessionStorage): boolean {
    const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
    if (!session?.timestamp) return false;
    const fifteenMinutesAgo = Date.now() - FIFTEEN_MINUTES_IN_MS;
    return session.timestamp > fifteenMinutesAgo;
}

const ANALYTICS_INFO_TIMER_INTERVAL = process.env.NODE_ENV === 'development' ? 5000 : 10000;

export interface AnalyticsProps {
    locale: string;
    clientKey: string;
    analyticsContext: string;
    enabled?: boolean;
    analyticsData?: AnalyticsOptions['analyticsData'];
}

export interface IAnalytics {
    setUp({ sessionId, checkoutStage }: { sessionId?: string; checkoutStage?: 'precheckout' | 'checkout' }): Promise<void>;
    flush(): void;
    sendAnalytics(event: AbstractAnalyticsEvent): void;
    getEventsQueue(): EventsQueueModule;
}

class Analytics implements IAnalytics {
    private readonly enabled: boolean = true;
    private readonly analyticsData?: AnalyticsOptions['analyticsData'];

    private readonly eventsQueue: EventsQueueModule;
    private readonly storage = new Storage<CheckoutAttemptIdSessionStorage>('checkout-attempt-id', 'sessionStorage');
    private readonly collectId: (attemptIdPayload: AttemptIdPayload) => Promise<string>;
    private readonly debouncedSendEventsFunction: () => void;

    private sendEventsTimeoutId: NodeJS.Timeout;
    private capturedCheckoutAttemptId?: string;

    constructor({ locale, clientKey, analyticsContext, enabled, analyticsData }: AnalyticsProps) {
        this.collectId = CollectId({
            analyticsContext,
            clientKey,
            locale,
            analyticsPath: ANALYTICS_PATH
        });
        this.eventsQueue = EventsQueue({ analyticsContext, clientKey, analyticsPath: ANALYTICS_PATH });
        this.debouncedSendEventsFunction = debounce(this.sendEvents.bind(this));

        if (enabled !== undefined) this.enabled = enabled;
        if (analyticsData) this.analyticsData = analyticsData;
    }

    public async setUp({ sessionId, checkoutStage }: { sessionId?: string; checkoutStage?: 'precheckout' | 'checkout' } = {}): Promise<void> {
        try {
            const checkoutAttemptIdSession = this.storage.get();
            const isSessionReusable = isSessionCreatedUnderFifteenMinutes(checkoutAttemptIdSession);

            const { applicationInfo, checkoutAttemptId: checkoutAttemptIdFromPayByLink } = processAnalyticsData(this.analyticsData);

            const availableCheckoutAttemptId: string | undefined = isSessionReusable ? checkoutAttemptIdSession.id : checkoutAttemptIdFromPayByLink;

            const attemptIdPayload: AttemptIdPayload = {
                checkoutStage: checkoutStage || 'checkout',
                level: this.enabled ? 'all' : 'initial',
                ...(applicationInfo && { applicationInfo }),
                ...(sessionId && { sessionId }),
                ...(availableCheckoutAttemptId && { checkoutAttemptId: availableCheckoutAttemptId })
            };

            this.capturedCheckoutAttemptId = await this.collectId(attemptIdPayload);

            this.storage.set({
                id: this.capturedCheckoutAttemptId,
                timestamp: isSessionReusable ? checkoutAttemptIdSession.timestamp : Date.now()
            });
        } catch (error: unknown) {
            console.warn(error);
        }
    }

    public sendAnalytics(event: AbstractAnalyticsEvent): void {
        if (!this.enabled) {
            return;
        }
        this.addEventToQueue(event);
    }

    public flush(): void {
        this.sendEvents();
    }

    public getEventsQueue(): EventsQueueModule {
        return this.eventsQueue;
    }

    /**
     * Info events don't have high priority, therefore  we add a delay in order to dispatch a batch of events
     * Log/Error events are sent almost immediately. There is a debounce mechanism in place but the delay is very minimal
     *
     * @param event
     * @private
     */
    private addEventToQueue(event: AbstractAnalyticsEvent): void {
        this.eventsQueue.add(event);

        if (event.getEventCategory() === 'info') {
            clearTimeout(this.sendEventsTimeoutId);
            this.sendEventsTimeoutId = setTimeout(() => this.debouncedSendEventsFunction(), ANALYTICS_INFO_TIMER_INTERVAL);
            return;
        }

        clearTimeout(this.sendEventsTimeoutId);
        this.debouncedSendEventsFunction();
    }

    private sendEvents(): void {
        if (this.capturedCheckoutAttemptId) {
            void this.eventsQueue.run(this.capturedCheckoutAttemptId);
        }
    }
}

export default Analytics;
