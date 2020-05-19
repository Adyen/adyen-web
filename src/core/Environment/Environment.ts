export const FALLBACK_CONTEXT = 'https://checkoutshopper-live.adyen.com/checkoutshopper/';

const resolveEnvironment = (env: string = FALLBACK_CONTEXT): string => {
    const environments = {
        test: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
        live: 'https://checkoutshopper-live.adyen.com/checkoutshopper/',
        'live-us': 'https://checkoutshopper-live-us.adyen.com/checkoutshopper/',
        'live-au': 'https://checkoutshopper-live-au.adyen.com/checkoutshopper/'
    };

    return environments[env] || environments[env.toLowerCase()] || env;
};

export default resolveEnvironment;
