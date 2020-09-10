/**
 * Log event to Adyen
 * @param config -
 */
const logTelemetry = config => event => {
    if (!config.accessKey) {
        return Promise.reject();
    }

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

    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(telemetryEvent)
    };

    return fetch(`${config.loadingContext}v1/analytics/log?token=${config.accessKey}`, options)
        .then(response => response.ok)
        .catch(() => {});
};

export default logTelemetry;
