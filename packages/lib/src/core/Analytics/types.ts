import { PaymentAmount } from '../../types';
import { CoreConfiguration } from '../types';
import { EventsQueueModule } from './EventsQueue';

export interface Experiment {
    controlGroup: boolean;
    experimentId: string;
    experimentName?: string;
}

export interface AnalyticsOptions {
    /**
     * Enable/Disable all analytics
     */
    enabled?: boolean;

    /**
     * Enable/Disable telemetry data
     */
    telemetry?: boolean;

    /**
     * Reuse a previous checkoutAttemptId from a previous page
     */
    checkoutAttemptId?: string;

    /**
     * Data to be sent along with the event data
     */
    payload?: any;

    /**
     * List of experiments to be sent in the collectId call // TODO - still used?
     */
    experiments?: Experiment[];
}

export type AnalyticsProps = Pick<CoreConfiguration, 'loadingContext' | 'locale' | 'clientKey' | 'analytics' | 'amount'> & {
    analyticsContext?: string;
};

export interface AnalyticsObject {
    timestamp: string;
    component: string;
    code?: string;
    errorType?: string;
    message?: string;
    type?: string;
    subtype?: string;
    target?: string;
    metadata?: Record<string, any>;
    isStoredPaymentMethod?: boolean;
    brand?: string;
}

export type ANALYTICS_ACTION = 'log' | 'error' | 'event';

export type CreateAnalyticsObject = Omit<AnalyticsObject, 'timestamp'> & { action: ANALYTICS_ACTION };

export type AnalyticsInitialEvent = {
    containerWidth: number;
    component: string;
    flavor: string;
    paymentMethods?: any[];
    sessionId?: string;
};

export type AnalyticsConfig = {
    analyticsContext?: string;
    clientKey?: string;
    locale?: string;
    amount?: PaymentAmount;
    loadingContext?: string;
};

export type CreateAnalyticsActionData = Omit<AnalyticsObject, 'timestamp'>;

export type CreateAnalyticsActionObject = {
    action: ANALYTICS_ACTION;
    data: CreateAnalyticsActionData;
};

export type EventQueueProps = Pick<AnalyticsConfig, 'analyticsContext' | 'clientKey'> & { analyticsPath: string };

export interface AnalyticsModule {
    setUp: (a: AnalyticsInitialEvent) => Promise<any>;
    getCheckoutAttemptId: () => string;
    getEventsQueue: () => EventsQueueModule;
    createAnalyticsAction: (a: CreateAnalyticsActionObject) => void;
    getEnabled: () => boolean;
}
