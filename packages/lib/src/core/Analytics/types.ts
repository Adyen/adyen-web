export interface AnalyticsOptions {
    /**
     * Enable/Disable all analytics
     */
    enabled?: boolean;

    /**
     * Enable/Disable telemetry data
     */
    telemetry?: boolean;

    /**
     * Enable/Disable conversion events
     */
    conversion?: boolean;

    /**
     * Reuse a previous checkoutAttemptId from a previous page
     */
    checkoutAttemptId?: string;

    /**
     * Data to be sent along with the event data
     */
    payload?: any;
}
