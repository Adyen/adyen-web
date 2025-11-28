import AdyenCheckoutError from '../Errors/AdyenCheckoutError';
import { AbstractAnalyticsEvent } from './events/AbstractAnalyticsEvent';
import { HttpOptions, httpPost } from '../Services/http';
import type { ApplicationInfo } from './types';

export interface IAnalyticsService {
    requestCheckoutAttemptId(payload: RequestAttemptIdPayload): Promise<string>;
    sendEvents(payload: AnalyticsEventPayload, checkoutAttemptId: string): Promise<void>;
    reportIntegrationFlavor(flavor: 'dropin' | 'components', checkoutAttemptId: string): Promise<void>;
}

export interface RequestAttemptIdPayload {
    version: string;
    channel: 'Web';
    platform: 'Web';
    locale: string;
    checkoutStage: 'precheckout' | 'checkout';
    referrer: string;
    screenWidth: number;
    buildType: string;
    level: 'initial' | 'all';
    sessionId?: string;
    checkoutAttemptId?: string;
    applicationInfo?: ApplicationInfo;
}

export interface AnalyticsEventPayload {
    channel: 'Web';
    platform: 'Web';
    info: Array<AbstractAnalyticsEvent>;
    errors: Array<AbstractAnalyticsEvent>;
    logs: Array<AbstractAnalyticsEvent>;
}

export interface AnalyticsFlavorPayload {
    flavor: 'dropin' | 'components';
    checkoutAttemptId: string;
}

const ANALYTICS_PATH = 'v3/analytics';

class AnalyticsService implements IAnalyticsService {
    private readonly clientKey: string;
    private readonly analyticsContext: string;

    constructor({ clientKey, analyticsContext }: { clientKey: string; analyticsContext: string }) {
        this.clientKey = clientKey;
        this.analyticsContext = analyticsContext;
    }

    public async requestCheckoutAttemptId(payload: RequestAttemptIdPayload) {
        const httpOptions: HttpOptions = {
            loadingContext: this.analyticsContext,
            path: `${ANALYTICS_PATH}?clientKey=${this.clientKey}`
        };

        try {
            const { checkoutAttemptId } = await httpPost<{ checkoutAttemptId: string }>(httpOptions, payload);
            return checkoutAttemptId;
        } catch (error: unknown) {
            throw new AdyenCheckoutError('NETWORK_ERROR', 'requestCheckoutAttemptId() - failed to get checkout attempt ID', { cause: error });
        }
    }

    public async sendEvents(payload: AnalyticsEventPayload, checkoutAttemptId: string): Promise<void> {
        if (!checkoutAttemptId) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'sendEvents() - checkoutAttemptId is required');
        }

        // No events to be sent
        if (!payload.info.length && !payload.errors.length && !payload.logs.length) {
            return Promise.resolve();
        }

        const httpOptions: HttpOptions = {
            loadingContext: this.analyticsContext,
            path: `${ANALYTICS_PATH}/${checkoutAttemptId}?clientKey=${this.clientKey}`
        };

        try {
            await httpPost(httpOptions, payload);
        } catch (error: unknown) {
            throw new AdyenCheckoutError('NETWORK_ERROR', 'sendEvents() - failed to send events', { cause: error });
        }
    }

    public async reportIntegrationFlavor(flavor: 'dropin' | 'components', checkoutAttemptId: string): Promise<void> {
        if (!flavor || !checkoutAttemptId) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'reportIntegrationFlavor() - flavor or checkoutAttemptId is required');
        }

        const httpOptions: HttpOptions = {
            loadingContext: this.analyticsContext,
            path: `${ANALYTICS_PATH}?clientKey=${this.clientKey}`
        };

        const payload: AnalyticsFlavorPayload = {
            flavor,
            checkoutAttemptId
        };

        try {
            await httpPost(httpOptions, payload);
        } catch (error: unknown) {
            throw new AdyenCheckoutError('NETWORK_ERROR', 'reportIntegrationFlavor() - failed to send flavor', { cause: error });
        }
    }
}

export { AnalyticsService };
