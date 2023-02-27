import { httpPost } from '../http';
import { AnalyticsProps } from '../../Analytics/Analytics';

type Config = Pick<AnalyticsProps, 'loadingContext' | 'locale' | 'clientKey' | 'amount'>;

/**
 * Log event to Adyen
 * @param config -
 */
const logTelemetry = (config: Config) => (event: any) => {
    if (!config.clientKey) return Promise.reject();

    const options = {
        errorLevel: 'silent' as const,
        loadingContext: config.loadingContext,
        path: `v2/analytics/log?clientKey=${config.clientKey}`
    };

    const telemetryEvent = {
        amountValue: config.amount?.value,
        amountCurrency: config.amount?.currency,
        version: process.env.VERSION,
        channel: 'Web',
        locale: config.locale,
        flavor: 'components',
        userAgent: navigator.userAgent,
        referrer: window.location.href,
        screenWidth: window.screen.width,
        ...event
    };

    return httpPost(options, telemetryEvent);
};

export default logTelemetry;
