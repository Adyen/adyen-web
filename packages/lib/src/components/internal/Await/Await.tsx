import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import classnames from 'classnames';
import { checkPaymentStatus } from '../../../core/Services/payment-status';
import processResponse from '../../../core/ProcessResponse';
import { getImageUrl } from '../../../utils/get-image';
import Spinner from '../../internal/Spinner';
import Countdown from '../Countdown';
import Button from '../Button';
import useCoreContext from '../../../core/Context/useCoreContext';
import { AwaitComponentProps, StatusObject } from './types';
import './Await.scss';

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
        const error = { type: 'error', props: { errorMessage: 'Payment Expired' } };
        props.onError(error, this);
    };

    const onTick = (time): void => {
        setPercentage(time.percentage);
    };

    const onComplete = (status: StatusObject): void => {
        setCompleted(true);
        const state = {
            data: {
                details: { payload: status.props.payload },
                paymentData: props.paymentData
            }
        };

        props.onComplete(state, this);
    };

    const onError = (status: StatusObject): void => {
        setExpired(true);
        const state = {
            data: {
                details: { payload: status.props.payload },
                paymentData: props.paymentData
            }
        };

        // Send error response to onAdditionalDetails
        props.onComplete(state, this);
    };

    const checkStatus = (): void => {
        const { paymentData, accessKey } = props;

        checkPaymentStatus(paymentData, accessKey, loadingContext)
            .then(processResponse)
            .catch(({ message, ...response }) => ({
                type: 'network-error',
                props: {
                    ...(message && { message: this.props.i18n.get(message) }),
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
        setTimeout((): void => {
            // Redirect to the APP failed
            const error = `${props.type} App was not found`;
            props.onError(error, this);
            fallback();
        }, 25);
        window.location.assign(url);
    };

    useEffect(() => {
        const { shouldRedirectOnMobile, url } = props;
        const isMobile: boolean = window.matchMedia('(max-width: 768px)').matches && /Android|iPhone|iPod/.test(navigator.userAgent);

        if (shouldRedirectOnMobile && url && isMobile) {
            this.redirectToApp(url, checkStatus);
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

            setStoredTimeout(setTimeout(statusInterval, delay));
        }
    }, [loading, timePassed, expired, completed]);

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
                    <span className="adyen-checkout__await__separator__label">{i18n.get('or')}</span>
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
    throttleTime: 60000,
    throttleInterval: 10000,
    showCountdownTimer: true,
    classNameModifiers: [],
    shouldRedirectOnMobile: false,
    url: null
};

export default Await;
