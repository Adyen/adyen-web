export interface AnalyticsOptions {
    /**
     * Enable/Disable all analytics
     */
    enabled?: boolean;
    /**
     * A wrapper to pass data needed when analytics is setup
     */
    analyticsData?: {
        /**
         * Relates to PMs used within Plugins
         * https://docs.adyen.com/development-resources/application-information/?tab=integrator_built_2#application-information-fields
         * @internal
         */
        applicationInfo?: ApplicationInfo;
        /**
         * Use a checkoutAttemptId from a previous page
         */
        checkoutAttemptId?: string;
    };
}

export interface ApplicationInfo {
    externalPlatform: {
        name: string;
        version: string;
        integrator: string;
    };
    merchantApplication: {
        name: string;
        version: string;
    };
    merchantDevice?: {
        os: string;
        osVersion: string;
    };
}
