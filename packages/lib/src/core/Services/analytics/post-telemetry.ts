import { httpPost } from '../http';

/**
 * Log event to Adyen
 * @param config -
 */
const logTelemetry = config => event => {
    if (!config.clientKey) return Promise.reject();

    const options = {
        errorLevel: 'silent' as const,
        loadingContext: config.loadingContext,
        path: `v2/analytics/log?clientKey=${config.clientKey}`
    };

    const telemetryEvent = {
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
