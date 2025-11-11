import { useState, useEffect, useRef } from 'preact/hooks';
import checkPaymentStatus from '../../core/Services/payment-status';
import processResponse from '../../core/ProcessResponse';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { CountdownTime } from '../../components/internal/Countdown/types';
import { PaymentStatusTimerActions, PaymentStatusTimerState, UsePaymentStatusTimerProps } from './types';
import {
    DEFAULT_PAYMENT_STATUS_TIMER_DELAY_MS,
    DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_INTERVAL_MS,
    DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_TIME_MS
} from './constants';
import { PaymentStatusObject } from '../../types';

export function usePaymentStatusTimer(props: UsePaymentStatusTimerProps): { state: PaymentStatusTimerState; actions: PaymentStatusTimerActions } {
    const [completed, setCompleted] = useState(false);
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [delay, setDelay] = useState(props.delay ?? DEFAULT_PAYMENT_STATUS_TIMER_DELAY_MS);
    const [percentage, setPercentage] = useState(0);
    const [timePassed, setTimePassed] = useState(0);
    const [onPollingStartedActionHandled, setOnPollingStartedActionHandled] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | number | null>(null);

    const onTick = (time: CountdownTime): void => {
        setPercentage(time.percentage);
    };

    const onTimeUp = (): void => {
        setExpired(true);
        props.onError(new AdyenCheckoutError('ERROR', 'Payment Expired'));
    };

    const onComplete = (status: PaymentStatusObject): void => {
        setCompleted(true);
        setLoading(false);

        if (status.props.payload) {
            const state = {
                data: {
                    details: { payload: status.props.payload },
                    paymentData: props.paymentData
                }
            };
            props.onComplete(state);
        } else {
            setExpired(true);
            props.onError(new AdyenCheckoutError('ERROR', 'successful result, but no payload in response'));
        }
    };

    const onError = (status: PaymentStatusObject): void => {
        setExpired(true);
        setLoading(false);

        if (status.props.payload) {
            const state = {
                data: {
                    details: { payload: status.props.payload },
                    paymentData: props.paymentData
                }
            };
            props.onComplete(state);
        } else {
            const error = new AdyenCheckoutError('ERROR', 'error result with no payload in response');
            props.onError(error);
        }
    };

    const checkStatus = async (): Promise<void> => {
        const { paymentData, clientKey, throttleInterval, pollStatus } = props;

        const pollStatusFunction = pollStatus ?? (() => checkPaymentStatus(paymentData, clientKey, props.loadingContext, throttleInterval));

        if (!onPollingStartedActionHandled) {
            props.onActionHandled?.({ componentType: props.type, actionDescription: 'polling-started' });
            setOnPollingStartedActionHandled(true);
        }

        return pollStatusFunction()
            .then(processResponse)
            .catch(response => ({
                type: 'network-error',
                props: response
            }))
            .then((status: PaymentStatusObject) => {
                switch (status.type) {
                    case 'success':
                        onComplete(status);
                        break;
                    case 'error':
                        onError(status);
                        break;
                    default:
                        setLoading(false);
                }
            });
    };

    useEffect(() => {
        void checkStatus();
    }, []);

    useEffect(() => {
        if (expired || completed || loading) {
            return;
        }

        let currentDelay = delay;

        const statusInterval = async (): Promise<void> => {
            const start = performance.now();
            await checkStatus();
            const end = performance.now();
            const responseTime = Math.round(end - start);

            const actualTimePassed = timePassed + responseTime + currentDelay;
            setTimePassed(actualTimePassed);

            if (
                actualTimePassed >= (props.throttleTime ?? DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_TIME_MS) &&
                currentDelay !== (props.throttleInterval ?? DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_INTERVAL_MS)
            ) {
                setDelay(props.throttleInterval ?? DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_INTERVAL_MS);
                currentDelay = props.throttleInterval ?? DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_INTERVAL_MS;
            }
        };

        timeoutRef.current = setTimeout(() => {
            void statusInterval();
        }, currentDelay);

        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, [expired, completed, loading, delay, props.throttleTime, props.throttleInterval, timePassed]);

    const state: PaymentStatusTimerState = {
        completed,
        expired,
        loading,
        percentage,
        timePassed
    };

    const actions: PaymentStatusTimerActions = {
        onTick,
        onTimeUp
    };

    return { state, actions };
}
