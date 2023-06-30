import { HttpOptions, httpPost } from '../Services/http';
import { AnalyticsObject, EventQueueProps } from './types';

interface CAActions {
    channel: 'Web';
    events: AnalyticsObject[];
    errors: AnalyticsObject[];
    logs: AnalyticsObject[];
}

export interface EQObject {
    add: (t, a) => void;
    run: (id) => Promise<any>;
    getQueue: () => CAActions;
    _runQueue: (id) => Promise<any>;
}

const CAEventsQueue = ({ analyticsContext, clientKey, analyticsPath }: EventQueueProps) => {
    const caActions: CAActions = {
        channel: 'Web',
        events: [],
        errors: [],
        logs: []
    };

    const eqObject: EQObject = {
        add: (type, actionObj) => {
            caActions[type].push(actionObj);
        },

        run: (checkoutAttemptId: string) => {
            const promise = eqObject._runQueue(checkoutAttemptId);

            caActions.events = [];
            caActions.errors = [];
            caActions.logs = [];

            return promise;
        },

        // Expose getter for testing purposes
        getQueue: () => caActions,

        _runQueue: (checkoutAttemptId: string): Promise<any> => {
            if (!caActions.events.length && !caActions.logs.length && !caActions.errors.length) {
                return Promise.resolve(null);
            }

            const options: HttpOptions = {
                errorLevel: 'silent' as const,
                loadingContext: analyticsContext,
                path: `${analyticsPath}/${checkoutAttemptId}?clientKey=${clientKey}`
            };

            const promise = httpPost(options, caActions)
                .then(() => {
                    // Succeed, silently
                    return undefined;
                })
                .catch(() => {
                    // Caught, silently, at http level. We do not expect this catch block to ever fire, but... just in case...
                    console.debug('### CAEventsQueue:::: send has failed');
                });

            return promise;
        }
    };

    return eqObject;
};

export default CAEventsQueue;
