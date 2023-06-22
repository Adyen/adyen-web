import logEvent from '../Services/analytics/log-event';
import collectId from '../Services/analytics/collect-id';
import { CoreOptions } from '../types';
import CAEventsQueue, { EQObject } from './CAEventsQueue';
import { ANALYTICS_ACTION, AnalyticsConfig, AnalyticsObject } from './types';
import { ANALYTICS_ACTION_ERROR, ANALYTICS_ACTION_LOG } from './constants';
import { debounce } from '../../components/internal/Address/utils';
import { AnalyticsModule } from '../../components/types';

export type AnalyticsProps = Pick<CoreOptions, 'loadingContext' | 'locale' | 'clientKey' | 'analytics' | 'amount' | 'analyticsContext'>;

let _checkoutAttemptId = null;

const Analytics = ({ loadingContext, locale, clientKey, analytics, amount, analyticsContext }: AnalyticsProps) => {
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
            _checkoutAttemptId = props.checkoutAttemptId;
        }
    }

    const _logEvent = logEvent({ loadingContext, locale });
    const _collectId = collectId({ analyticsContext, clientKey, locale, amount });
    const _caEventsQueue: EQObject = CAEventsQueue({ analyticsContext, clientKey });

    const analyticsObj: AnalyticsModule = {
        send: (config: AnalyticsConfig) => {
            const { enabled, payload, telemetry } = props; // TODO what is payload, is it ever used?

            if (enabled === true) {
                if (telemetry === true && !_checkoutAttemptId) {
                    // fetch a new checkoutAttemptId if none is already available
                    _collectId({ ...config, ...(payload && { ...payload }) })
                        .then(checkoutAttemptId => {
                            console.log('### Analytics::setting checkoutAttemptId:: ', checkoutAttemptId);
                            _checkoutAttemptId = checkoutAttemptId;
                        })
                        .catch(e => {
                            console.warn(`Fetching checkoutAttemptId failed.${e ? ` Error=${e}` : ''}`);
                        });
                }
                // Log pixel // TODO once we stop using the pixel we can stop requiring both "enabled" & "telemetry" config options
                _logEvent(config);
            }
        },

        // used in BaseElement
        getCheckoutAttemptId: (): string => _checkoutAttemptId,

        addAnalyticsAction: (type: ANALYTICS_ACTION, obj: AnalyticsObject) => {
            _caEventsQueue.add(`${type}s`, obj);

            // errors get sent straight away, logs almost do (with a debounce), events are stored until an error or log comes along
            if (type === ANALYTICS_ACTION_LOG || type === ANALYTICS_ACTION_ERROR) {
                const debounceFn = type === ANALYTICS_ACTION_ERROR ? fn => fn : debounce;
                debounceFn(analyticsObj.sendAnalyticsActions)();
            }
        },

        sendAnalyticsActions: () => {
            if (_checkoutAttemptId) {
                return _caEventsQueue.run(_checkoutAttemptId);
            }
            return Promise.resolve(null);
        }
    };

    return analyticsObj;
};

export default Analytics;
