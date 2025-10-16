import { AnalyticsConfig, AnalyticsData, AnalyticsInitialEvent } from '../../Analytics/types';
import { PaymentAmount } from '../../../types';

export type CheckoutAttemptIdSession = {
    id: string;
    timestamp: number;
};

export type CollectIdProps = Pick<AnalyticsConfig, 'clientKey' | 'analyticsContext' | 'locale' | 'amount'> & {
    analyticsPath: string;
};

export type TelemetryEvent = {
    version: string;
    channel: 'Web';
    platform: 'Web';
    locale?: string;
    referrer?: string;
    screenWidth?: number;
    containerWidth?: number;
    component?: string;
    flavor?: string;
    buildType?: string;
    amount?: PaymentAmount;
} & AnalyticsInitialEvent &
    AnalyticsData;

export type CollectIdEvent = AnalyticsInitialEvent & AnalyticsData;
