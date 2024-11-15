import CollectId from '../Services/analytics/collect-id';
import EventsQueue, { EventsQueueModule } from './EventsQueue';
import { AnalyticsEvent, AnalyticsInitialEvent, AnalyticsObject, AnalyticsProps, CreateAnalyticsEventObject } from './types';
import { ANALYTICS_INFO_TIMER_INTERVAL, ANALYTICS_PATH, ANALYTICS_EVENT } from './constants';
import { debounce } from '../../utils/debounce';
import { AnalyticsModule } from '../../types/global-types';
import { createAnalyticsObject, processAnalyticsData } from './utils';
import { analyticsPreProcessor } from './analyticsPreProcessor';

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

    const addAnalyticsEvent = (type: AnalyticsEvent, obj: AnalyticsObject) => {
        const arrayName = type === ANALYTICS_EVENT.info ? type : `${type}s`;
        eventsQueue.add(`${arrayName}`, obj);

        /**
         * The logic is:
         *  - info events are stored until a log or error comes along,
         *  but, if after a set time, no other analytics event (log or error) has come along then we send the info events anyway
         */
        if (type === ANALYTICS_EVENT.info) {
            clearTimeout(sendEventsTimerId);
            sendEventsTimerId = setTimeout(() => void sendAnalyticsEvents(), ANALYTICS_INFO_TIMER_INTERVAL);
        }

        /**
         * The logic is:
         *  - errors and logs get sent straightaway
         *  ...but... tests with the 3DS2 process show that many logs can happen almost at the same time (or you can have an error followed immediately by a log),
         *  so instead of making several sequential api calls we see if we can "batch" them using debounce
         */
        if (type === ANALYTICS_EVENT.log || type === ANALYTICS_EVENT.error) {
            clearTimeout(sendEventsTimerId); // clear any timer that might be about to dispatch the info events array

            debounce(sendAnalyticsEvents)();
        }
    };

    const anlModule: AnalyticsModule = {
        /**
         * Make "setup" call, to pass containerWidth, buildType, channel etc, and receive a checkoutAttemptId in return
         * @param initialEvent -
         */
        setUp: async (initialEvent: AnalyticsInitialEvent) => {
            const { payload } = props; // TODO what is payload, is it ever used?

            const analyticsData = processAnalyticsData(props.analyticsData);

            if (!capturedCheckoutAttemptId) {
                try {
                    const checkoutAttemptId = await collectId({
                        ...initialEvent,
                        ...(payload && { ...payload }),
                        ...(Object.keys(analyticsData).length && { ...analyticsData })
                    });
                    capturedCheckoutAttemptId = checkoutAttemptId;
                } catch (e: any) {
                    console.warn(`Fetching checkoutAttemptId failed.${e ? ` Error=${e}` : ''}`);
                }
            }
        },

        getCheckoutAttemptId: (): string => capturedCheckoutAttemptId,

        // Expose getter for testing purposes
        getEventsQueue: () => eventsQueue,

        createAnalyticsEvent: ({ event, data }: CreateAnalyticsEventObject): AnalyticsObject => {
            if (!props.enabled) return;

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

    anlModule.sendAnalytics = props.enabled === true ? analyticsPreProcessor(anlModule) : () => {};

    return anlModule;
};

export default Analytics;
