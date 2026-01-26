import { debounce } from '../../utils/debounce';
import { processAnalyticsData } from './utils';
import { AbstractAnalyticsEvent, AnalyticsEventCategory } from './events/AbstractAnalyticsEvent';
import Storage from '../../utils/Storage';
import { LIBRARY_BUNDLE_TYPE, LIBRARY_VERSION } from '../config';
import { AnalyticsEventQueue } from './AnalyticsEventQueue';
import type { AnalyticsOptions } from './types';
import type { AnalyticsEventPayload, IAnalyticsService, RequestAttemptIdPayload } from './AnalyticsService';

export interface AnalyticsProps {
    service: IAnalyticsService;
    eventQueue: AnalyticsEventQueue;
    enabled?: boolean;
    analyticsData?: AnalyticsOptions['analyticsData'];
}

export interface IAnalytics {
    checkoutAttemptId?: string;
    setUp({ sessionId, checkoutStage, locale }: { sessionId?: string; checkoutStage?: 'precheckout' | 'checkout'; locale?: string }): Promise<void>;
    sendFlavor(flavor: 'dropin' | 'components'): Promise<void>;
    sendAnalytics(event: AbstractAnalyticsEvent): void;
    flush(): void;
}

export interface CheckoutAttemptIdSessionStorage {
    id: string;
    timestamp: number;
}

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

const ANALYTICS_INFO_DEBOUNCE_DELAY = process.env.NODE_ENV === 'development' ? 5_000 : 10_000;
const ANALYTICS_ERROR_AND_LOGS_DEBOUNCE_DELAY = 5_000;

class Analytics implements IAnalytics {
    private readonly analyticsData?: AnalyticsOptions['analyticsData'];
    private readonly service: IAnalyticsService;
    private readonly eventsQueue: AnalyticsEventQueue;
    private readonly storage = new Storage<CheckoutAttemptIdSessionStorage>('checkout-attempt-id', 'sessionStorage');
    private readonly debouncedSendInfoEvents: () => void;
    private readonly debouncedSendEvents: () => void;

    private enabled: boolean = true;
    private capturedCheckoutAttemptId?: string;
    private isFlavorReported = false;

    constructor({ service, eventQueue, enabled, analyticsData }: AnalyticsProps) {
        this.service = service;
        this.eventsQueue = eventQueue;

        this.debouncedSendInfoEvents = debounce(this.sendEvents.bind(this), ANALYTICS_INFO_DEBOUNCE_DELAY);
        this.debouncedSendEvents = debounce(this.sendEvents.bind(this), ANALYTICS_ERROR_AND_LOGS_DEBOUNCE_DELAY);

        if (enabled !== undefined) this.enabled = enabled;
        if (analyticsData) this.analyticsData = analyticsData;
    }

    public get checkoutAttemptId(): string {
        return this.capturedCheckoutAttemptId;
    }

    public async setUp({
        sessionId,
        checkoutStage,
        locale
    }: { sessionId?: string; locale?: string; checkoutStage?: 'precheckout' | 'checkout' } = {}): Promise<void> {
        try {
            const checkoutAttemptIdSession = this.storage.get();
            const isSessionReusable = isSessionCreatedUnderFifteenMinutes(checkoutAttemptIdSession);

            const { applicationInfo, checkoutAttemptId: checkoutAttemptIdFromPayByLink } = processAnalyticsData(this.analyticsData);

            const availableCheckoutAttemptId: string | undefined = isSessionReusable ? checkoutAttemptIdSession.id : checkoutAttemptIdFromPayByLink;

            const payload: RequestAttemptIdPayload = {
                version: LIBRARY_VERSION,
                buildType: LIBRARY_BUNDLE_TYPE,
                channel: 'Web',
                platform: 'Web',
                locale,
                referrer: window.location.href,
                screenWidth: window.screen.width,
                checkoutStage: checkoutStage || 'checkout',
                level: this.enabled ? 'all' : 'initial',
                ...(applicationInfo && { applicationInfo }),
                ...(sessionId && { sessionId }),
                ...(availableCheckoutAttemptId && { checkoutAttemptId: availableCheckoutAttemptId })
            };

            this.capturedCheckoutAttemptId = await this.service.requestCheckoutAttemptId(payload);

            this.storage.set({
                id: this.capturedCheckoutAttemptId,
                timestamp: isSessionReusable ? checkoutAttemptIdSession.timestamp : Date.now()
            });
        } catch (error: unknown) {
            this.enabled = false;
            console.warn('Analytics: Error setting up', error);
        }
    }

    public sendAnalytics(event: AbstractAnalyticsEvent): void {
        if (!this.enabled) {
            return;
        }

        try {
            this.addEventToQueue(event);
        } catch (error: unknown) {
            console.warn('Analytics: Error adding event to queue', error);
        }
    }

    public async sendFlavor(flavor: 'dropin' | 'components'): Promise<void> {
        if (!this.capturedCheckoutAttemptId) return;
        if (this.isFlavorReported) return;

        this.isFlavorReported = true;

        try {
            await this.service.reportIntegrationFlavor(flavor, this.capturedCheckoutAttemptId);
        } catch (error) {
            console.warn('Analytics: Error reporting flavor', error);
        }
    }

    public flush(): void {
        void this.sendEvents();
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

        if (event.getEventCategory() === AnalyticsEventCategory.info) {
            this.debouncedSendInfoEvents();
        } else {
            this.debouncedSendEvents();
        }
    }

    private async sendEvents(): Promise<void> {
        if (!this.capturedCheckoutAttemptId || !this.enabled) {
            return;
        }

        const payload: AnalyticsEventPayload = {
            channel: 'Web',
            platform: 'Web',
            info: this.eventsQueue.infoEvents,
            errors: this.eventsQueue.errorEvents,
            logs: this.eventsQueue.logEvents
        };

        this.eventsQueue.clear();

        try {
            await this.service.sendEvents(payload, this.capturedCheckoutAttemptId);
        } catch (error) {
            console.warn('Analytics: Error sending events', error);
        }
    }
}

export default Analytics;
