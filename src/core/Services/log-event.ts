import { version } from '../../../package.json';

/**
 * Log event to Adyen
 * @param {object} config ready to be serialized and included in the request
 * @return {function} A log event function
 */
const logEvent = config => event => {
    const params = {
        version,
        payload_version: 1,
        platform: 'web',
        locale: config.locale,
        ...event
    };

    const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    new Image().src = `${config.loadingContext}images/analytics.png?${queryString}`;
};

export default logEvent;
