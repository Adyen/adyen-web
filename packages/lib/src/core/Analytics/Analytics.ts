import CollectId from '../Services/analytics/collect-id';
import EventsQueue, { EventsQueueModule } from './EventsQueue';
import { AnalyticsEventCategory, AnalyticsInitialEvent, AnalyticsObject, AnalyticsProps } from './types';
import { ANALYTIC_LEVEL, ANALYTICS_INFO_TIMER_INTERVAL, ANALYTICS_PATH, ANALYTICS_EVENT } from './constants';
import { debounce } from '../../utils/debounce';
import { AnalyticsModule } from '../../types/global-types';
import { processAnalyticsData } from './utils';
import { AnalyticsEvent } from './AnalyticsEvent';

let capturedCheckoutAttemptId = null;
let sendEventsTimerId = null;

const Analytics = ({ locale, clientKey, analytics, amount, analyticsContext, bundleType }: AnalyticsProps): AnalyticsModule => {
    const defaultProps = {
        enabled: true,
        checkoutAttemptId: null,
        analyticsData: {}
    };

    const props = { ...defaultProps, ...analytics };

    const collectId = CollectId({ analyticsContext, clientKey, locale, amount, analyticsPath: ANALYTICS_PATH, bundleType });
    const eventsQueue: EventsQueueModule = EventsQueue({ analyticsContext, clientKey, analyticsPath: ANALYTICS_PATH });

    const sendAnalyticsEvents = () => {
        if (capturedCheckoutAttemptId) {
            return eventsQueue.run(capturedCheckoutAttemptId);
        }
        return Promise.resolve(null);
    };

    const addAnalyticsEvent = (eventCat: AnalyticsEventCategory, obj: AnalyticsObject) => {
        const arrayName = eventCat === ANALYTICS_EVENT.info ? eventCat : `${eventCat}s`;
        eventsQueue.add(`${arrayName}`, obj);

        /**
         * The logic is:
         *  - info events are stored until a log or error comes along,
         *  but, if after a set time, no other analytics event (log or error) has come along then we send the info events anyway
         */
        if (eventCat === ANALYTICS_EVENT.info) {
            clearTimeout(sendEventsTimerId);
            sendEventsTimerId = setTimeout(() => void sendAnalyticsEvents(), ANALYTICS_INFO_TIMER_INTERVAL);
        }

        /**
         * The logic is:
         *  - errors and logs get sent straightaway
         *  ...but... tests with the 3DS2 process show that many logs can happen almost at the same time (or you can have an error followed immediately by a log),
         *  so instead of making several sequential api calls we see if we can "batch" them using debounce
         */
        if (eventCat === ANALYTICS_EVENT.log || eventCat === ANALYTICS_EVENT.error) {
            clearTimeout(sendEventsTimerId); // clear any timer that might be about to dispatch the info events array

            debounce(sendAnalyticsEvents)();
        }
    };

    return {
        /**
         * Make "setup" call, to pass containerWidth, buildType, channel etc, and receive a checkoutAttemptId in return
         * @param initialEvent -
         */
        setUp: async (initialEvent: AnalyticsInitialEvent) => {
            const { payload, enabled } = props; // TODO what is payload, is it ever used?
            const level = enabled ? ANALYTIC_LEVEL.all : ANALYTIC_LEVEL.initial;
            const analyticsData = processAnalyticsData(props.analyticsData);
            if (!capturedCheckoutAttemptId) {
                try {
                    capturedCheckoutAttemptId = await collectId({
                        ...initialEvent,
                        ...(payload && { ...payload }),
                        ...(Object.keys(analyticsData).length && { ...analyticsData }),
                        ...{ level }
                    });
                } catch (e: any) {
                    console.warn(`Fetching checkoutAttemptId failed.${e ? ` Error=${e}` : ''}`);
                }
            }
        },

        getCheckoutAttemptId: (): string => capturedCheckoutAttemptId,

        // Expose getter for testing purposes
        getEventsQueue: () => eventsQueue,

        getEnabled: () => props.enabled,

        sendAnalytics: (analyticsObj: AnalyticsEvent): boolean => {
            if (!props.enabled) return false;

            const eventCategory: AnalyticsEventCategory = analyticsObj.getEventCategory();

            addAnalyticsEvent(eventCategory, analyticsObj);

            return true;
        }
    } as AnalyticsModule;
};

export default Analytics;
