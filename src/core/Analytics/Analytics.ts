import logEvent from '../Services/log-event';
import postTelemetry from '../Services/post-telemetry';
import collectId from '../Services/collect-id';
import EventsQueue from './EventsQueue';

class Analytics {
    private static defaultProps = {
        enabled: true,
        telemetry: false,
        conversion: false,
        conversionId: null
    };

    public conversionId = null;
    public props;
    private readonly logEvent;
    private readonly logTelemetry;
    private readonly queue = new EventsQueue();

    constructor({ loadingContext, locale, originKey, clientKey, analytics }) {
        this.props = { ...Analytics.defaultProps, ...analytics };
        this.logEvent = logEvent({ loadingContext, locale });
        this.logTelemetry = postTelemetry({ loadingContext, locale, originKey, clientKey });

        const { conversion, enabled } = this.props;

        if (conversion && enabled) {
            if (this.props.conversionId) {
                this.conversionId = this.props.conversionId;
                this.queue.run(this.conversionId);
            } else {
                // If no conversionId is provided, fetch a new one
                collectId({ loadingContext, originKey, clientKey })
                    .then(conversionId => {
                        this.conversionId = conversionId;
                        this.queue.run(this.conversionId);
                    })
                    .catch(() => {
                        this.queue.run();
                    });
            }
        }
    }

    send(event) {
        const { conversion, enabled, telemetry } = this.props;

        if (enabled === true) {
            if (telemetry === true) {
                const telemetryTask = conversionId => this.logTelemetry({ ...event, conversionId });
                this.queue.add(telemetryTask);

                // Not waiting for conversionId
                if (!conversion || this.conversionId) {
                    this.queue.run(this.conversionId);
                }
            }

            // Log pixel
            this.logEvent(event);
        }
    }
}

export default Analytics;
