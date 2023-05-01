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
