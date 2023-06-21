export const FALLBACK_CONTEXT = 'https://checkoutshopper-live.adyen.com/checkoutshopper/';

export const resolveEnvironment = (env: string = FALLBACK_CONTEXT): string => {
    const environments = {
        test: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
        live: 'https://checkoutshopper-live.adyen.com/checkoutshopper/',
        'live-us': 'https://checkoutshopper-live-us.adyen.com/checkoutshopper/',
        'live-au': 'https://checkoutshopper-live-au.adyen.com/checkoutshopper/',
        'live-apse': 'https://checkoutshopper-live-apse.adyen.com/checkoutshopper/',
        'live-in': 'https://checkoutshopper-live-in.adyen.com/checkoutshopper/'
    };

    return environments[env] || environments[env.toLowerCase()] || env;
};

export const FALLBACK_CDN_CONTEXT = 'https://checkoutshopper-live.adyen.com/checkoutshopper/';

export const resolveCDNEnvironment = (env: string = FALLBACK_CDN_CONTEXT) => {
    const environments = {
        beta: 'https://cdf6519016.cdn.adyen.com/checkoutshopper/',
        test: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
        live: 'https://checkoutshopper-live.adyen.com/checkoutshopper/',
        'live-us': 'https://checkoutshopper-live-us.adyen.com/checkoutshopper/',
        'live-au': 'https://checkoutshopper-live-au.adyen.com/checkoutshopper/',
        'live-apse': 'https://checkoutshopper-live-apse.adyen.com/checkoutshopper/',
        'live-in': 'https://checkoutshopper-live-in.adyen.com/checkoutshopper/'
    };

    return environments[env] || environments[env.toLowerCase()] || env;
};

export const FALLBACK_ANALYTICS_CONTEXT = 'https://checkoutanalytics-live.adyen.com/checkoutanalytics/';

export const resolveAnalyticsEnvironment = (env: string = FALLBACK_ANALYTICS_CONTEXT) => {
    const environments = {
        test: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
        live: 'https://checkoutanalytics-live.adyen.com/checkoutanalytics/',
        'live-us': 'https://checkoutanalytics-live-us.adyen.com/checkoutanalytics/',
        'live-au': 'https://checkoutanalytics-live-au.adyen.com/checkoutanalytics/',
        'live-apse': 'https://checkoutanalytics-live-apse.adyen.com/checkoutanalytics/',
        'live-in': 'https://checkoutanalytics-live-in.adyen.com/checkoutanalytics/'
    };

    return environments[env] || environments[env.toLowerCase()] || env;
};
