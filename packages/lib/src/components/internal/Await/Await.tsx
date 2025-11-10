import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import classnames from 'classnames';
import checkPaymentStatus from '../../../core/Services/payment-status';
import processResponse from '../../../core/ProcessResponse';
import Spinner from '../../internal/Spinner';
import Countdown from '../Countdown';
import Button from '../Button';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { AwaitComponentProps, StatusObject } from './types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import ContentSeparator from '../ContentSeparator';
import { CountdownTime } from '../Countdown/types';
import './Await.scss';
import { AwaitFinalState } from './components/AwaitFinalState';

export function Await(props: AwaitComponentProps) {
    const { i18n, loadingContext } = useCoreContext();
    const [completed, setCompleted] = useState(false);
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasCalledActionHandled, setHasCalledActionHandled] = useState(false);
    const [delay, setDelay] = useState(props.delay);
    const [percentage, setPercentage] = useState(100);
    const [timePassed, setTimePassed] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | number | null>(null);

    const { amount } = props;

    const redirectToApp = (url: string): void => {
        window.location.assign(url);
    };

    const onTick = (time: CountdownTime): void => {
        setPercentage(time.percentage);
    };

    const onTimeUp = (): void => {
        setExpired(true);
        props.onError(new AdyenCheckoutError('ERROR', 'Payment Expired'));
    };

    const onComplete = (status: StatusObject): void => {
        // Only make details call if we have a payload
        if (status.props.payload) {
            setCompleted(true);
            const state = {
                data: {
                    details: { payload: status.props.payload },
                    paymentData: props.paymentData
                }
            };
            // Send success response to onAdditionalDetails
            return props.onComplete(state);
        }

        // Show error state & call merchant defined error callback if we do not have a payload
        setExpired(true);
        props.onError(new AdyenCheckoutError('ERROR', 'successful result, but no payload in response'));
    };

    const onError = (status: StatusObject): void => {
        setExpired(true);
        setLoading(false);

        // Only make details call if we have a payload
        if (status.props.payload) {
            const state = {
                data: {
                    details: { payload: status.props.payload },
                    paymentData: props.paymentData
                }
            };
            // Send error response to onAdditionalDetails
            return props.onComplete(state);
        }

        // Call merchant defined error callback if we do not have a payload
        const error = new AdyenCheckoutError('ERROR', 'error result with no payload in response');
        props.onError(error);
    };

    const checkStatus = async (): Promise<void> => {
        const { paymentData, clientKey, throttleInterval, pollStatus } = props;

        // If there's a custom pollStatus function, call it.
        // Otherwise, call the default one.
        const pollStatusFunction = pollStatus ?? (() => checkPaymentStatus(paymentData, clientKey, loadingContext, throttleInterval));

        if (!hasCalledActionHandled) {
            props.onActionHandled?.({ componentType: props.type, actionDescription: 'polling-started' });
            setHasCalledActionHandled(true);
        }

        return pollStatusFunction()
            .then(processResponse)
            .catch(({ message, ...response }) => ({
                type: 'network-error',
                props: {
                    ...(message && { message: i18n.get(message) }),
                    ...response
                }
            }))
            .then((status: StatusObject) => {
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
        if (props.shouldRedirectAutomatically && props.url) {
            redirectToApp(props.url);
        }
    }, [props.shouldRedirectAutomatically, props.url]);

    useEffect(() => {
        void checkStatus();
    }, []);

    useEffect(() => {
        if (expired || completed || loading) {
            return;
        }
        // Retry until getting a complete response from the server OR it times out
        // Changes setTimeout time to new value (throttleInterval) after a certain amount of time (throttleTime) has passed
        let currentDelay = delay;

        const statusInterval = async (): Promise<void> => {
            const start = performance.now();
            await checkStatus();
            const end = performance.now();
            const responseTime = Math.round(end - start);

            const actualTimePassed = timePassed + responseTime + currentDelay;
            setTimePassed(actualTimePassed);

            if (actualTimePassed >= props.throttleTime && currentDelay !== props.throttleInterval) {
                setDelay(props.throttleInterval);
                currentDelay = props.throttleInterval;
            }
        };

        timeoutRef.current = setTimeout(() => {
            void statusInterval();
        }, currentDelay);

        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, [expired, completed, loading, delay, props.throttleTime, props.throttleInterval, timePassed]);

    if (expired) {
        return <AwaitFinalState image="error" message={i18n.get('error.subtitle.payment')} />;
    }

    if (completed) {
        return <AwaitFinalState image="success" message={i18n.get('creditCard.success')} />;
    }

    if (loading) {
        return (
            <div className="adyen-checkout__await">
                {props.brandLogo && <img src={props.brandLogo} alt={props.type} className="adyen-checkout__await__brand-logo" />}
                <Spinner inline={false} size="large" />
            </div>
        );
    }

    const timeToPayString = i18n.get('wechatpay.timetopay').split('%@');

    return (
        <div
            className={classnames(
                'adyen-checkout__await',
                `adyen-checkout__await--${props.type}`,
                props.classNameModifiers.map(m => `adyen-checkout__await--${m}`)
            )}
        >
            {props.brandLogo && <img src={props.brandLogo} alt={props.type} className="adyen-checkout__await__brand-logo" />}

            {/* Everything is wrapped in !! so we evaluate the result as boolean,
             otherwise we might just print the value or object as mistake */}
            {!!(props.showAmount && amount?.value !== null && amount?.currency) && (
                <div className="adyen-checkout__await__amount">{i18n.amount(amount.value, amount.currency)}</div>
            )}

            {props.messageText != null && <div className="adyen-checkout__await__subtitle">{props.messageText}</div>}

            <div className="adyen-checkout__await__indicator-holder">
                <div className="adyen-checkout__await__indicator-spinner">
                    <Spinner inline={false} size="medium" />
                </div>
                <div className="adyen-checkout__await__indicator-text">{props.awaitText}</div>
            </div>

            {props.showCountdownTimer && (
                <div className="adyen-checkout__await__countdown-holder">
                    <div className="adyen-checkout__await__progress">
                        <span className="adyen-checkout__await__percentage" style={{ width: `${percentage}%` }} />
                    </div>

                    <div className="adyen-checkout__await__countdown">
                        {timeToPayString[0]}&nbsp;
                        <Countdown minutesFromNow={props.countdownTime} onTick={onTick} onCompleted={onTimeUp} />
                        &nbsp;{timeToPayString[1]}
                    </div>
                </div>
            )}

            {props.url && !props.shouldRedirectAutomatically && (
                <div className="adyen-checkout__await__app-link">
                    <ContentSeparator />
                    <Button classNameModifiers={['await']} onClick={() => redirectToApp(props.url)} label={i18n.get('openApp')} />
                </div>
            )}

            {props.instructions && (
                <div className="adyen-checkout__await__instructions">
                    {typeof props.instructions === 'string' ? i18n.get(props.instructions) : props.instructions?.()}
                </div>
            )}

            {props.endSlot && <div className="adyen-checkout__await__end-slot">{props.endSlot()}</div>}
        </div>
    );
}

Await.defaultProps = {
    countdownTime: 15,
    onError: () => {},
    onComplete: () => {},
    delay: 2_000,
    throttleTime: 60_000,
    throttleInterval: 10_000,
    showCountdownTimer: true,
    classNameModifiers: [],
    url: null
};
