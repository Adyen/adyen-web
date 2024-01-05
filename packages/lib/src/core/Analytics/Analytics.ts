import LogEvent from '../Services/analytics/log-event';
import CollectId from '../Services/analytics/collect-id';
import EventsQueue, { EventsQueueModule } from './EventsQueue';
import { ANALYTICS_ACTION, AnalyticsInitialEvent, AnalyticsObject, AnalyticsProps, CreateAnalyticsActionObject, AnalyticsModule } from './types';
import { ANALYTICS_ACTION_ERROR, ANALYTICS_ACTION_EVENT, ANALYTICS_ACTION_LOG, ANALYTICS_EVENT_TIMER_INTERVAL, ANALYTICS_PATH } from './constants';
import { debounce } from '../../components/internal/Address/utils';
import { createAnalyticsObject } from './utils';

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

    const sendAnalyticsActions = () => {
        if (capturedCheckoutAttemptId) {
            return eventsQueue.run(capturedCheckoutAttemptId);
        }
        return Promise.resolve(null);
    };

    const addAnalyticsAction = (type: ANALYTICS_ACTION, obj: AnalyticsObject) => {
        eventsQueue.add(`${type}s`, obj);

        /**
         * The logic is:
         *  - events are stored until a log or error comes along,
         *  but, if after a set time, no other analytics-action has come along then we send the events anyway
         */
        if (type === ANALYTICS_ACTION_EVENT) {
            clearTimeout(sendEventsTimerId);
            sendEventsTimerId = setTimeout(sendAnalyticsActions, ANALYTICS_EVENT_TIMER_INTERVAL);
        }

        /**
         * The logic is:
         *  - errors get sent straightaway
         *  - logs also get sent straightaway... but... tests with the 3DS2 process show that many logs can happen almost at the same time,
         *  so instead of making (up to 4) sequential api calls we "batch" them using debounce
         */
        if (type === ANALYTICS_ACTION_LOG || type === ANALYTICS_ACTION_ERROR) {
            clearTimeout(sendEventsTimerId); // clear any time that might be about to dispatch the events array

            const debounceFn = type === ANALYTICS_ACTION_ERROR ? fn => fn : debounce;
            debounceFn(sendAnalyticsActions)();
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
                        // Caught at collectId level. We do not expect this catch block to ever fire, but... just in case...
                        console.debug(`Fetching checkoutAttemptId failed.${e ? ` Error=${e}` : ''}`);
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

        createAnalyticsAction: ({ action, data }: CreateAnalyticsActionObject) => {
            const aObj: AnalyticsObject = createAnalyticsObject({
                action,
                ...data
            });
            // console.log('### Analytics::createAnalyticsAction:: action=', action, ' aObj=', aObj);

            addAnalyticsAction(action, aObj);
        },

        getEnabled: () => props.enabled
    };

    return anlModule;
};

export default Analytics;
