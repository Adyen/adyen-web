import { AnalyticsConfig } from '../../Analytics/types';

type CheckoutAttemptIdSession = {
    id: string;
    timestamp: number;
};

type CollectIdProps = Pick<AnalyticsConfig, 'clientKey' | 'analyticsContext' | 'locale' | 'amount'>;

type LogEventProps = Pick<AnalyticsConfig, 'loadingContext' | 'locale'>;

export { CheckoutAttemptIdSession, CollectIdProps, LogEventProps };
