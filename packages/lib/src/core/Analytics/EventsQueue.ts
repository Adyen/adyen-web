import { HttpOptions, httpPost } from '../Services/http';
import { AnalyticsObject, EventQueueProps } from './types';

interface CAActions {
    channel: 'Web';
    platform: 'Web';
    info: AnalyticsObject[];
    errors: AnalyticsObject[];
    logs: AnalyticsObject[];
}

export interface EventsQueueModule {
    add: (t: string, o: AnalyticsObject) => void;
    run: (id: string) => Promise<any>;
    getQueue: () => CAActions;
}

const EventsQueue = ({ analyticsContext, clientKey, analyticsPath }: EventQueueProps): EventsQueueModule => {
    const caActions: CAActions = {
        channel: 'Web',
        platform: 'Web',
        info: [],
        errors: [],
        logs: []
    };

    const runQueue = async (checkoutAttemptId: string): Promise<any> => {
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
        add: (type, actionObj) => {
            caActions[type].push(actionObj);
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
