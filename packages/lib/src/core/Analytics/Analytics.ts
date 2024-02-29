import LogEvent from '../Services/analytics/log-event';
import CollectId from '../Services/analytics/collect-id';
import EventsQueue, { EventsQueueModule } from './EventsQueue';
import { ANALYTICS_EVENT, AnalyticsInitialEvent, AnalyticsObject, AnalyticsProps, CreateAnalyticsEventObject } from './types';
import { ANALYTICS_EVENT_ERROR, ANALYTICS_EVENT_INFO, ANALYTICS_EVENT_LOG, ANALYTICS_INFO_TIMER_INTERVAL, ANALYTICS_PATH } from './constants';
import { debounce } from '../../utils/debounce';
import { AnalyticsModule } from '../../types/global-types';
import { createAnalyticsObject } from './utils';
import { analyticsPreProcessor } from './analyticsPreProcessor';

let capturedCheckoutAttemptId = null;
let hasLoggedPixel = false;
let sendEventsTimerId = null;

const Analytics = ({ loadingContext, locale, clientKey, analytics, amount, analyticsContext }: AnalyticsProps): AnalyticsModule => {
    const defaultProps = {
        enabled: true,
        telemetry: true,
        checkoutAttemptId: null
    };

    const props = { ...defaultProps, ...analytics };

    const { telemetry, enabled } = props;
    if (telemetry === true && enabled === true) {
        if (props.checkoutAttemptId) {
            // handle prefilled checkoutAttemptId // TODO is this still something that ever happens?
            capturedCheckoutAttemptId = props.checkoutAttemptId;
        }
    }

    const logEvent = LogEvent({ loadingContext, locale });
    const collectId = CollectId({ analyticsContext, clientKey, locale, amount, analyticsPath: ANALYTICS_PATH });
    const eventsQueue: EventsQueueModule = EventsQueue({ analyticsContext, clientKey, analyticsPath: ANALYTICS_PATH });

    const sendAnalyticsEvents = () => {
        if (capturedCheckoutAttemptId) {
            return eventsQueue.run(capturedCheckoutAttemptId);
        }
        return Promise.resolve(null);
    };

    const addAnalyticsEvent = (type: ANALYTICS_EVENT, obj: AnalyticsObject) => {
        const arrayName = type === ANALYTICS_EVENT_INFO ? type : `${type}s`;
        eventsQueue.add(`${arrayName}`, obj);

        /**
         * The logic is:
         *  - info events are stored until a log or error comes along,
         *  but, if after a set time, no other analytics event (log or error) has come along then we send the info events anyway
         */
        if (type === ANALYTICS_EVENT_INFO) {
            clearTimeout(sendEventsTimerId);
            sendEventsTimerId = setTimeout(sendAnalyticsEvents, ANALYTICS_INFO_TIMER_INTERVAL);
        }

        /**
         * The logic is:
         *  - errors and logs get sent straightaway
         *  ...but... tests with the 3DS2 process show that many logs can happen almost at the same time (or you can have an error followed immediately by a log),
         *  so instead of making several sequential api calls we see if we can "batch" them using debounce
         */
        if (type === ANALYTICS_EVENT_LOG || type === ANALYTICS_EVENT_ERROR) {
            clearTimeout(sendEventsTimerId); // clear any timer that might be about to dispatch the info events array

            debounce(sendAnalyticsEvents)();
        }
    };

    const anlModule: AnalyticsModule = {
        setUp: async (initialEvent: AnalyticsInitialEvent) => {
            const { enabled, payload, telemetry } = props; // TODO what is payload, is it ever used?

            // console.log('### Analytics::setUp:: initialEvent', initialEvent);

            if (enabled === true) {
                if (telemetry === true && !capturedCheckoutAttemptId) {
                    try {
                        // fetch a new checkoutAttemptId if none is already available
                        const checkoutAttemptId = await collectId({ ...initialEvent, ...(payload && { ...payload }) });
                        capturedCheckoutAttemptId = checkoutAttemptId;
                    } catch (e) {
                        console.warn(`Fetching checkoutAttemptId failed.${e ? ` Error=${e}` : ''}`);
                    }
                }

                if (!hasLoggedPixel) {
                    // Log pixel
                    // TODO once we stop using the pixel we can stop requiring both "enabled" & "telemetry" config options.
                    //  And v6 will have a "level: 'none" | "all" | "minimal" config prop
                    logEvent(initialEvent);
                    hasLoggedPixel = true;
                }
            }
        },

        getCheckoutAttemptId: (): string => capturedCheckoutAttemptId,

        // Expose getter for testing purposes
        getEventsQueue: () => eventsQueue,

        createAnalyticsEvent: ({ event, data }: CreateAnalyticsEventObject): AnalyticsObject => {
            const aObj: AnalyticsObject = createAnalyticsObject({
                event,
                ...data
            });
            // console.log('### Analytics::createAnalyticsEvent:: event=', event, ' aObj=', aObj);

            addAnalyticsEvent(event, aObj);

            return aObj;
        },

        getEnabled: () => props.enabled,

        sendAnalytics: null
    };

    anlModule.sendAnalytics = analyticsPreProcessor(anlModule);

    return anlModule;
};

export default Analytics;
