import fetchJsonData from './fetch-json-data';

/**
 * Log event to Adyen
 * @param config -
 */
const logTelemetry = config => event => {
    if (!config.clientKey) return Promise.reject();

    const options = {
        clientKey: config.clientKey,
        errorLevel: 'silent' as const,
        loadingContext: config.loadingContext,
        path: 'v1/analytics/log'
    };

    const telemetryEvent = {
        version: process.env.VERSION,
        platform: 'web',
        locale: config.locale,
        flavor: 'components',
        userAgent: navigator.userAgent,
        referrer: window.location.href,
        screenWidth: window.screen.width,
        ...event
    };

    return fetchJsonData(options, telemetryEvent);
};

export default logTelemetry;
