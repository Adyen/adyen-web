interface Experiment {
    experimentId: string;
    controlGroup: boolean;
}

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
     * Reuse a previous conversionId from a previous page
     */
    conversionId?: string;

    /**
     * Data to be sent along with the event data
     */
    payload?: any;

    /**
     * List of experiments to be sent in the collectId call
     */
    experiments?: Experiment[];
}
