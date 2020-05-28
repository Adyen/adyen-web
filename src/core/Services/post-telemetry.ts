import { version } from '../../../package.json';

/**
 * Log event to Adyen
 * @param {object} config
 * @return {function}
 */
const logTelemetry = config => event => {
    const telemetryEvent = {
        version,
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

    const accessKey = config.clientKey || config.originKey;
    return fetch(`${config.loadingContext}v1/analytics/log?token=${accessKey}`, options)
        .then(response => response.ok)
        .catch(() => {});
};

export default logTelemetry;
