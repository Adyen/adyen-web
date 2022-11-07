import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import classnames from 'classnames';
import checkPaymentStatus from '../../../core/Services/payment-status';
import processResponse from '../../../core/ProcessResponse';
import { getImageUrl } from '../../../utils/get-image';
import Spinner from '../../internal/Spinner';
import Countdown from '../Countdown';
import Button from '../Button';
import useCoreContext from '../../../core/Context/useCoreContext';
import { AwaitComponentProps, StatusObject } from './types';
import './Await.scss';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import ContentSeparator from '../ContentSeparator';

function Await(props: AwaitComponentProps) {
    const { i18n, loadingContext } = useCoreContext();
    const [completed, setCompleted] = useState(false);
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [delay, setDelay] = useState(props.delay);
    const [percentage, setPercentage] = useState(100);
    const [timePassed, setTimePassed] = useState(0);
    const [hasAdjustedTime, setHasAdjustedTime] = useState(false);
    const [storedTimeout, setStoredTimeout] = useState(null);

    const onTimeUp = (): void => {
        setExpired(true);
        clearTimeout(storedTimeout);
        props.onError(new AdyenCheckoutError('ERROR', 'Payment Expired'));
    };

    const onTick = (time): void => {
        setPercentage(time.percentage);
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
            return props.onComplete(state, this);
        }

        // Show error state & call merchant defined error callback if we do not have a payload
        setExpired(true);
        props.onError(new AdyenCheckoutError('ERROR', 'successful result, but no payload in response'));
    };

    const onError = (status: StatusObject): void => {
        setExpired(true);

        // Only make details call if we have a payload
        if (status.props.payload) {
            const state = {
                data: {
                    details: { payload: status.props.payload },
                    paymentData: props.paymentData
                }
            };
            // Send error response to onAdditionalDetails
            return props.onComplete(state, this);
        }

        // Call merchant defined error callback if we do not have a payload
        props.onError(new AdyenCheckoutError('ERROR', 'error result with no payload in response'));
    };

    const checkStatus = (): void => {
        const { paymentData, clientKey } = props;

        checkPaymentStatus(paymentData, clientKey, loadingContext)
            .then(processResponse)
            .catch(({ message, ...response }) => ({
                type: 'network-error',
                props: {
                    ...(message && { message: props.getI18n(message) }),
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

    const redirectToApp = (url, fallback = (): void => {}): void => {
        setTimeout(fallback, 1000);
        window.location.assign(url);
    };

    useEffect(() => {
        const { shouldRedirectOnMobile, url } = props;
        const isMobile: boolean = window.matchMedia('(max-width: 768px)').matches && /Android|iPhone|iPod/.test(navigator.userAgent);

        if (shouldRedirectOnMobile && url && isMobile) {
            redirectToApp(url, checkStatus);
        } else {
            checkStatus();
        }

        return (): void => {
            clearTimeout(storedTimeout);
        };
    }, []);

    useEffect(() => {
        if (expired) return clearTimeout(storedTimeout);

        if (completed) return clearTimeout(storedTimeout);

        if (!loading) {
            // Retry until getting a complete response from the server OR it times out
            // Changes setTimeout time to new value (throttleInterval) after a certain amount of time (throttleTime) has passed
            const statusInterval = (): void => {
                checkStatus();

                const actualTimePassed = timePassed + delay;
                setTimePassed(actualTimePassed);

                if (actualTimePassed >= props.throttleTime && !hasAdjustedTime) {
                    setDelay(props.throttleInterval);
                    setHasAdjustedTime(true);
                }
            };

            // Reset 'loading' to ensure that it is changes to this value that are the main "engine" that drives this useEffect
            setLoading(true);

            // Create (another) interval to poll for a result
            setStoredTimeout(setTimeout(statusInterval, delay));
        }
    }, [loading, expired, completed]);

    const finalState = (image, message) => (
        <div className="adyen-checkout__await adyen-checkout__await--result">
            <img
                className="adyen-checkout__await__icon adyen-checkout__await__icon--result"
                src={getImageUrl({ loadingContext, imageFolder: 'components/' })(image)}
                alt={i18n.get(message)}
            />
            <div className="adyen-checkout__await__subtitle adyen-checkout__await__subtitle--result">{i18n.get(message)}</div>
        </div>
    );

    if (expired) {
        return finalState('error', 'error.subtitle.payment');
    }

    if (completed) {
        return finalState('success', 'creditCard.success');
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

            <div className="adyen-checkout__await__subtitle">{props.messageText}</div>

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

            {props.url && (
                <div className="adyen-checkout__await__app-link">
                    <ContentSeparator />
                    <Button classNameModifiers={['await']} onClick={() => redirectToApp(props.url)} label={i18n.get('openApp')} />
                </div>
            )}
        </div>
    );
}

Await.defaultProps = {
    countdownTime: 15,
    onError: () => {},
    onComplete: () => {},
    delay: 2000,
    throttleTime: 60000,
    throttleInterval: 10000,
    showCountdownTimer: true,
    classNameModifiers: [],
    shouldRedirectOnMobile: false,
    url: null
};

export default Await;
