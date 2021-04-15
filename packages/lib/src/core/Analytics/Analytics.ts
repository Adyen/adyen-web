import logEvent from '../Services/log-event';
import postTelemetry from '../Services/post-telemetry';
import collectId from '../Services/collect-id';
import EventsQueue from './EventsQueue';
import { CoreOptions } from '../types';

class Analytics {
    private static defaultProps = {
        enabled: true,
        telemetry: true,
        conversion: false,
        checkoutAttemptId: null
    };

    public checkoutAttemptId = null;
    public props;
    private readonly logEvent;
    private readonly logTelemetry;
    private readonly queue = new EventsQueue();
    public readonly collectId;

    constructor({ loadingContext, locale, clientKey, analytics }: CoreOptions) {
        this.props = { ...Analytics.defaultProps, ...analytics };
        this.logEvent = logEvent({ loadingContext, locale });
        this.logTelemetry = postTelemetry({ loadingContext, locale, clientKey });
        this.collectId = collectId({ loadingContext, clientKey });

        const { conversion, enabled } = this.props;
        if (conversion === true && enabled === true) {
            if (this.props.checkoutAttemptId) {
                // handle prefilled checkoutAttemptId
                this.checkoutAttemptId = this.props.checkoutAttemptId;
                this.queue.run(this.checkoutAttemptId);
            }
        }
    }

    send(event) {
        const { conversion, enabled, payload, telemetry } = this.props;

        if (enabled === true) {
            if (conversion === true && !this.checkoutAttemptId) {
                // fetch a new checkoutAttemptId if none is already available
                this.collectId().then(checkoutAttemptId => {
                    this.checkoutAttemptId = checkoutAttemptId;
                    this.queue.run(this.checkoutAttemptId);
                });
            }

            if (telemetry === true) {
                const telemetryTask = checkoutAttemptId =>
                    this.logTelemetry({ ...event, ...(payload && { ...payload }), checkoutAttemptId }).catch(() => {});
                this.queue.add(telemetryTask);

                // Not waiting for checkoutAttemptId
                if (!conversion || this.checkoutAttemptId) {
                    this.queue.run(this.checkoutAttemptId);
                }
            }

            // Log pixel
            this.logEvent(event);
        }
    }
}

export default Analytics;
