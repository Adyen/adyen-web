import { AnalyticsConfig } from '../../Analytics/types';
import { PaymentAmount } from '../../../types';

export type CheckoutAttemptIdSession = {
    id: string;
    timestamp: number;
};

export type CollectIdProps = Pick<AnalyticsConfig, 'clientKey' | 'analyticsContext' | 'locale' | 'amount'>;

export type LogEventProps = Pick<AnalyticsConfig, 'loadingContext' | 'locale'>;

export type TelemetryEvent = {
    version: string;
    channel: 'Web';
    locale: string;
    referrer: string;
    screenWidth: number;
    containerWidth: number;
    component: string;
    flavor: string;
    amount?: PaymentAmount;
};
