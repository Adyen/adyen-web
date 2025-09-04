import CollectId from '../Services/analytics/collect-id';
import EventsQueue, { EventsQueueModule } from './EventsQueue';
import { AnalyticsEventCategory, AnalyticsInitialEvent, AnalyticsObject, AnalyticsProps } from './types';
import { ANALYTIC_LEVEL, ANALYTICS_INFO_TIMER_INTERVAL, ANALYTICS_PATH, ANALYTICS_EVENT } from './constants';
import { debounce } from '../../utils/debounce';
import { AnalyticsModule } from '../../types/global-types';
import { processAnalyticsData } from './utils';
import { AnalyticsEvent } from './AnalyticsEvent';
import Storage from '../../utils/Storage';
import { CheckoutAttemptIdSession } from '../Services/analytics/types';

let capturedCheckoutAttemptId: string | null = null;
let sendEventsTimerId = null;

/**
 * If the checkout attempt ID was stored more than fifteen minutes ago, then we should request a new ID.
 * More here: COWEB-1099
 */
function isSessionCreatedUnderFifteenMinutes(session: CheckoutAttemptIdSession): boolean {
    const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
    if (!session?.timestamp) return false;
    const fifteenMinutesAgo = Date.now() - FIFTEEN_MINUTES_IN_MS;
    return session.timestamp > fifteenMinutesAgo;
}

const Analytics = ({ locale, clientKey, analytics, analyticsContext, bundleType }: AnalyticsProps): AnalyticsModule => {
    const defaultProps = {
        enabled: true
    };

    const props = { ...defaultProps, ...analytics };

    const collectId = CollectId({
        analyticsContext,
        clientKey,
        locale,
        analyticsPath: ANALYTICS_PATH,
        bundleType
    });

    const storage = new Storage<CheckoutAttemptIdSession>('checkout-attempt-id', 'sessionStorage');
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
        setUp: async (setupProps?: AnalyticsInitialEvent): Promise<void> => {
            const defaultProps: Partial<AnalyticsInitialEvent> = { checkoutStage: 'Checkout' };
            const finalSetupProps = { ...defaultProps, ...setupProps };

            const checkoutAttemptIdSession = storage.get();
            const isSessionReusable = isSessionCreatedUnderFifteenMinutes(checkoutAttemptIdSession);

            const { payload, enabled } = props;
            const level = enabled ? ANALYTIC_LEVEL.all : ANALYTIC_LEVEL.initial;
            const analyticsData = processAnalyticsData(props.analyticsData);

            const availableCheckoutAttemptId: string | undefined = isSessionReusable ? checkoutAttemptIdSession.id : analyticsData?.checkoutAttemptId;

            try {
                const collectIdPayload = {
                    ...finalSetupProps,
                    ...payload,
                    ...analyticsData,
                    ...(availableCheckoutAttemptId && { checkoutAttemptId: availableCheckoutAttemptId }),
                    level
                };

                capturedCheckoutAttemptId = await collectId(collectIdPayload);

                storage.set({
                    id: capturedCheckoutAttemptId,
                    timestamp: isSessionReusable ? checkoutAttemptIdSession.timestamp : Date.now()
                });
            } catch (error: unknown) {
                console.warn(error);
            }
        },

        getCheckoutAttemptId: (): string => capturedCheckoutAttemptId,

        // Expose getter for testing purposes
        getEventsQueue: () => eventsQueue,

        getEnabled: () => props.enabled,

        flush: () => {
            void sendAnalyticsEvents();
        },

        sendAnalytics: (analyticsObj: AnalyticsEvent): boolean => {
            if (!props.enabled) return false;

            const eventCategory: AnalyticsEventCategory = analyticsObj.getEventCategory();

            addAnalyticsEvent(eventCategory, analyticsObj);

            return true;
        }
    } as AnalyticsModule;
};

export default Analytics;
