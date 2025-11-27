import { HttpOptions, httpPost } from '../Services/http';
import { AbstractAnalyticsEvent } from './events/AbstractAnalyticsEvent';

interface CAActions {
    channel: 'Web';
    platform: 'Web';
    info: AbstractAnalyticsEvent[];
    errors: AbstractAnalyticsEvent[];
    logs: AbstractAnalyticsEvent[];
}

export interface EventsQueueModule {
    add: (event: AbstractAnalyticsEvent) => void;
    run: (id: string) => Promise<any>;
    getQueue: () => CAActions;
}

interface EventsQueueProps {
    analyticsContext: string;
    clientKey: string;
    analyticsPath: string;
}

const EventsQueue = ({ analyticsContext, clientKey, analyticsPath }: EventsQueueProps): EventsQueueModule => {
    const caActions: CAActions = {
        channel: 'Web',
        platform: 'Web',
        info: [],
        errors: [],
        logs: []
    };

    const runQueue = (checkoutAttemptId: string): Promise<any> => {
        if (!caActions.info.length && !caActions.logs.length && !caActions.errors.length) {
            return Promise.resolve(null);
        }

        const options: HttpOptions = {
            errorLevel: 'silent' as const,
            loadingContext: analyticsContext,
            path: `${analyticsPath}/${checkoutAttemptId}?clientKey=${clientKey}`
        };

        return httpPost(options, caActions)
            .then(() => {
                // Succeed, silently
                return undefined;
            })
            .catch(() => {
                // Caught, silently, at http level. We do not expect this catch block to ever fire, but... just in case...
                console.debug('### EventsQueue:::: send has failed');
            });
    };

    return {
        add: (event: AbstractAnalyticsEvent) => {
            const category = event.getEventCategory();

            if (category === 'info') caActions.info.push(event);
            if (category === 'error') caActions.errors.push(event);
            if (category === 'log') caActions.logs.push(event);
        },

        run: (checkoutAttemptId: string) => {
            const promise = runQueue(checkoutAttemptId);

            caActions.info = [];
            caActions.errors = [];
            caActions.logs = [];

            return promise;
        },

        // Expose getter for testing purposes
        getQueue: () => caActions
    };
};

export default EventsQueue;
