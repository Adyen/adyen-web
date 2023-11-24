import { httpPost } from '../http';
import { PaymentAmount } from '../../../types/global-types';

type LogTelemetryConfig = {
    loadingContext: string;
    locale: string;
    clientKey: string;
    amount: PaymentAmount;
};

/**
 * Log event to Adyen
 * @param config -
 */
const logTelemetry = (config: LogTelemetryConfig) => (event: any) => {
    if (!config.clientKey) {
        return Promise.reject();
    }

    const options = {
        errorLevel: 'silent' as const,
        loadingContext: config.loadingContext,
        path: `v2/analytics/log?clientKey=${config.clientKey}`
    };

    const telemetryEvent = {
        amount: {
            value: config.amount?.value || 0,
            currency: config.amount?.currency
        },
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
