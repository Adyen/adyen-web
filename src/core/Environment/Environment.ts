import { EnvironmentOptions } from '../types';

export const FALLBACK_CONTEXT = 'https://checkoutshopper-live.adyen.com/checkoutshopper/';

const resolveEnvironment = (env: EnvironmentOptions | string = FALLBACK_CONTEXT): string => {
    switch (env) {
        case EnvironmentOptions.TEST:
            return 'https://checkoutshopper-test.adyen.com/checkoutshopper/';
        case EnvironmentOptions.LIVE:
            return 'https://checkoutshopper-live.adyen.com/checkoutshopper/';
        case EnvironmentOptions.LIVE_US:
            return 'https://checkoutshopper-live-us.adyen.com/checkoutshopper/';
        case EnvironmentOptions.LIVE_AU:
            return 'https://checkoutshopper-live-au.adyen.com/checkoutshopper/';
        default:
            return env;
    }
};

export default resolveEnvironment;
