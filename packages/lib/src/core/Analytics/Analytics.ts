import logEvent from '../Services/analytics/log-event';
import postTelemetry from '../Services/analytics/post-telemetry';
import collectId from '../Services/analytics/collect-id';
import EventsQueue from './EventsQueue';
import { CoreOptions } from '../types';

class Analytics {
    private static defaultProps = {
        enabled: true,
        telemetry: true,
        conversion: false,
        conversionId: null
    };

    public conversionId = null;
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
            if (this.props.conversionId) {
                // handle prefilled conversionId
                this.conversionId = this.props.conversionId;
                this.queue.run(this.conversionId);
            }
        }
    }

    send(event) {
        const { conversion, enabled, payload, telemetry } = this.props;

        if (enabled === true) {
            if (conversion === true && !this.conversionId) {
                // fetch a new conversionId if none is already available
                this.collectId().then(conversionId => {
                    this.conversionId = conversionId;
                    this.queue.run(this.conversionId);
                });
            }

            if (telemetry === true) {
                const telemetryTask = conversionId => this.logTelemetry({ ...event, ...(payload && { ...payload }), conversionId }).catch(() => {});
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
