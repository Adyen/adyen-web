const API_ENVIRONMENTS = {
    test: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
    live: 'https://checkoutshopper-live.adyen.com/checkoutshopper/',
    'live-us': 'https://checkoutshopper-live-us.adyen.com/checkoutshopper/',
    'live-au': 'https://checkoutshopper-live-au.adyen.com/checkoutshopper/',
    'live-apse': 'https://checkoutshopper-live-apse.adyen.com/checkoutshopper/',
    'live-in': 'https://checkoutshopper-live-in.adyen.com/checkoutshopper/',
    fallback: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
};

const CDN_ENVIRONMENTS = {
    test: 'https://cdf6519016.cdn.adyen.com/checkoutshopper/',
    live: 'https://bae81f955b.cdn.adyen.com/checkoutshopper/',
    'live-us': 'https://26280c4f4d.cdn.adyen.com/checkoutshopper/',
    'live-au': 'https://1706f728fe.cdn.adyen.com/checkoutshopper/',
    'live-apse': 'https://0688ecafff.cdn.adyen.com/checkoutshopper/',
    'live-in': 'https://0b777a1160.cdn.adyen.com/checkoutshopper/',
    fallback: 'https://bae81f955b.cdn.adyen.com/checkoutshopper/'
};

const ANALYTICS_ENVIRONMENTS = {
    test: 'https://checkoutanalytics-test.adyen.com/checkoutanalytics/',
    live: 'https://checkoutanalytics-live.adyen.com/checkoutanalytics/',
    'live-us': 'https://checkoutanalytics-live-us.adyen.com/checkoutanalytics/',
    'live-au': 'https://checkoutanalytics-live-au.adyen.com/checkoutanalytics/',
    'live-apse': 'https://checkoutanalytics-live-apse.adyen.com/checkoutanalytics/',
    'live-in': 'https://checkoutanalytics-live-in.adyen.com/checkoutanalytics/',
    fallback: 'https://checkoutanalytics-live.adyen.com/checkoutanalytics/'
};

export { API_ENVIRONMENTS, CDN_ENVIRONMENTS, ANALYTICS_ENVIRONMENTS };
