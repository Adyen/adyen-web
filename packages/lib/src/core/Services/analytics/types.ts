import { AnalyticsConfig } from '../../Analytics/types';

export type CheckoutAttemptIdSession = {
    id: string;
    timestamp: number;
};

export type CollectIdProps = Pick<AnalyticsConfig, 'clientKey' | 'analyticsContext' | 'locale' | 'amount'>;

export type LogEventProps = Pick<AnalyticsConfig, 'loadingContext' | 'locale'>;
