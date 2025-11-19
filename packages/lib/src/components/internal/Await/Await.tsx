import classnames from 'classnames';
import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import {
    usePaymentStatusTimer,
    DEFAULT_PAYMENT_STATUS_TIMER_COUNTDOWN_TIME_MIN,
    DEFAULT_PAYMENT_STATUS_TIMER_DELAY_MS,
    DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_INTERVAL_MS,
    DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_TIME_MS
} from '../../../hooks/usePaymentStatusTimer';
import Spinner from '../../internal/Spinner';
import Button from '../Button';
import ContentSeparator from '../ContentSeparator';
import Countdown from '../Countdown';
import { AwaitFinalState } from './components/AwaitFinalState';
import { AwaitComponentProps } from './types';
import { redirectToApp } from '../../../utils/urls';
import './Await.scss';

export function Await(props: AwaitComponentProps) {
    const { i18n, loadingContext } = useCoreContext();

    const { state: timerState, actions: timerActions } = usePaymentStatusTimer({
        loadingContext,
        paymentData: props.paymentData,
        clientKey: props.clientKey,
        delay: props.delay,
        throttleTime: props.throttleTime,
        throttleInterval: props.throttleInterval,
        type: props.type,
        onError: props.onError,
        onComplete: props.onComplete,
        pollStatus: props.pollStatus,
        onActionHandled: props.onActionHandled
    });

    const { completed, expired, loading, percentage } = timerState;
    const { onTick, onTimeUp } = timerActions;

    const { amount } = props;

    useEffect(() => {
        if (props.shouldRedirectAutomatically && props.url) {
            redirectToApp(props.url);
        }
    }, [props.shouldRedirectAutomatically, props.url]);

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
    countdownTime: DEFAULT_PAYMENT_STATUS_TIMER_COUNTDOWN_TIME_MIN,
    delay: DEFAULT_PAYMENT_STATUS_TIMER_DELAY_MS,
    throttleTime: DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_TIME_MS,
    throttleInterval: DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_INTERVAL_MS,
    onError: () => {},
    onComplete: () => {},
    showCountdownTimer: true,
    classNameModifiers: [],
    url: null
};
