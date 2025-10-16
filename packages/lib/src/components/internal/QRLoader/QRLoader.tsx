import { h, ComponentChildren } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Button from '../Button';
import Spinner from '../Spinner';
import checkPaymentStatus from '../../../core/Services/payment-status';
import processResponse from '../../../core/ProcessResponse';

import './QRLoader.scss';
import { QRLoaderProps } from './types';
import copyToClipboard from '../../../utils/clipboard';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import ContentSeparator from '../ContentSeparator';
import { StatusObject } from '../Await/types';
import useImage from '../../../core/Context/useImage';
import { useA11yReporter } from '../../../core/Errors/useA11yReporter';
import useAutoFocus from '../../../utils/useAutoFocus';
import { ANALYTICS_DOWNLOAD_STR, ANALYTICS_QR_CODE_DOWNLOAD } from '../../../core/Analytics/constants';
import { AnalyticsInfoEvent } from '../../../core/Analytics/AnalyticsInfoEvent';
import { CountdownTime } from '../Countdown/types';
import QRDetails from './components/QRDetails';
import { QRLoaderDetailsProvider } from './QRLoaderDetailsProvider';

const QRCODE_URL = 'utility/v1/barcode.png?type=qrCode&data=';

function QRLoader(props: QRLoaderProps & { children?: ComponentChildren }) {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const [completed, setCompleted] = useState(false);
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [delay, setDelay] = useState(props.delay);
    const [percentage, setPercentage] = useState(100);
    const [timePassed, setTimePassed] = useState(0);
    const [hasAdjustedTime, setHasAdjustedTime] = useState(false);
    const [storedTimeout, setStoredTimeout] = useState<NodeJS.Timeout | number | null>(null);

    const redirectToApp = (url: string | URL): void => {
        window.location.assign(url);
    };

    const onTick = (time: CountdownTime): void => {
        setPercentage(time.percentage);
    };

    const onTimeUp = (): void => {
        setExpired(true);
        clearTimeout(storedTimeout);
        props.onError(new AdyenCheckoutError('ERROR', 'Payment Expired'));
    };

    const onComplete = (status: StatusObject): void => {
        clearTimeout(storedTimeout);
        setCompleted(true);
        setLoading(false);

        const state = {
            data: {
                details: { payload: status.props.payload },
                paymentData: props.paymentData
            }
        };

        props.onComplete(state, this);
    };

    const onError = (status: StatusObject): void => {
        clearTimeout(storedTimeout);
        setExpired(true);
        setLoading(false);

        if (status.props.payload) {
            const state = {
                data: {
                    details: { payload: status.props.payload },
                    paymentData: props.paymentData
                }
            };
            props.onComplete(state, this);
        }

        const error = new AdyenCheckoutError('ERROR', 'error result with no payload in response');
        return props.onError(error);
    };

    const checkStatus = async (): Promise<void> => {
        const { paymentData, clientKey, throttledInterval } = props;

        return checkPaymentStatus(paymentData, clientKey, loadingContext, throttledInterval)
            .then(processResponse)
            .catch(response => ({ type: 'network-error', props: response }))
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
        void checkStatus();
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
            const statusInterval = async (): Promise<void> => {
                await checkStatus();

                const actualTimePassed = timePassed + delay;
                // timePassed is the value that is the main "engine" that drives this useEffect/polling
                setTimePassed(actualTimePassed);

                if (actualTimePassed >= props.throttleTime && !hasAdjustedTime) {
                    setDelay(props.throttledInterval);
                    setHasAdjustedTime(true);
                }
            };

            // Create (another) interval to poll for a result
            setStoredTimeout(setTimeout(() => void statusInterval(), delay));
        }
    }, [loading, expired, completed, timePassed]);

    const { amount, showAmount, url, brandLogo, brandName, countdownTime, type, onActionHandled } = props;

    const qrCodeImage = props.qrCodeData
        ? `${loadingContext}${QRCODE_URL}${props.qrCodeData}&clientKey=${props.clientKey}`
        : props.qrCodeImage;

    const handleCopy = (complete: () => void) => {
        void copyToClipboard(props.qrCodeData);

        const event = new AnalyticsInfoEvent({
            type: ANALYTICS_DOWNLOAD_STR,
            target: ANALYTICS_QR_CODE_DOWNLOAD
        });
        props.onSubmitAnalytics(event);

        complete();
    };

    const onQrCodeLoad = () => {
        onActionHandled?.({
            componentType: props.type,
            actionDescription: 'qr-code-loaded'
        });
    };

    const finalState = (image: string, message: string) => {
        const status = i18n.get(message);
        useA11yReporter(status);
        return (
            <div className="adyen-checkout__qr-loader adyen-checkout__qr-loader--result">
                <img
                    className="adyen-checkout__qr-loader__icon adyen-checkout__qr-loader__icon--result"
                    src={getImage({ imageFolder: 'components/' })(image)}
                    alt={status}
                />
                <div className="adyen-checkout__qr-loader__subtitle">{status}</div>
            </div>
        );
    };

    if (expired) {
        return finalState('error', 'error.subtitle.payment');
    }

    if (completed) {
        return finalState('success', 'creditCard.success');
    }

    if (loading) {
        return (
            <div className="adyen-checkout__qr-loader">
                {brandLogo && (
                    <div className="adyen-checkout__qr-loader__brand-logo-wrapper">
                        <img alt={brandName} src={brandLogo} className="adyen-checkout__qr-loader__brand-logo" />
                    </div>
                )}
                <Spinner />
            </div>
        );
    }

    const qrSubtitleRef = useAutoFocus();
    const classnames = props.classNameModifiers.map(m => `adyen-checkout__qr-loader--${m}`);

    return (
        <div className={`adyen-checkout__qr-loader adyen-checkout__qr-loader--${type} ${classnames.join(' ')}`}>
            {brandLogo && (
                <div className="adyen-checkout__qr-loader__brand-logo-wrapper">
                    <img src={brandLogo} alt={brandName} className="adyen-checkout__qr-loader__brand-logo" />
                </div>
            )}

            {showAmount && amount && amount.value !== null && !!amount.currency && (
                <h1 className="adyen-checkout__qr-loader__payment_amount">{i18n.amount(amount.value, amount.currency)}</h1>
            )}

            {url && (
                <div className="adyen-checkout__qr-loader__app-link">
                    {props.redirectIntroduction && (
                        <p className="adyen-checkout__qr-loader__subtitle">{i18n.get(props.redirectIntroduction)}</p>
                    )}
                    <Button classNameModifiers={['qr-loader']} onClick={() => redirectToApp(url)} label={i18n.get(props.buttonLabel)} />
                    <ContentSeparator />
                </div>
            )}

            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
            <p ref={qrSubtitleRef} tabIndex={0} className="adyen-checkout__qr-loader__subtitle">
                {typeof props.introduction === 'string' ? i18n.get(props.introduction) : props.introduction?.()}
            </p>

            <QRLoaderDetailsProvider
                qrCodeImage={qrCodeImage}
                qrCodeData={props.qrCodeData}
                percentage={percentage}
                timeToPay={props.timeToPay}
                copyBtn={props.copyBtn}
                instructions={props.instructions}
                countdownTime={countdownTime}
                onTick={(time: CountdownTime) => onTick(time)}
                onQRCodeLoad={onQrCodeLoad}
                onTimeUp={() => onTimeUp()}
                handleCopy={handleCopy}
            >
                {props.children ? props.children : <QRDetails />}
            </QRLoaderDetailsProvider>
        </div>
    );
}

QRLoader.defaultProps = {
    delay: 2000,
    countdownTime: 15,
    onError: () => {},
    onComplete: () => {},
    throttleTime: 60000,
    classNameModifiers: [],
    throttledInterval: 10000,
    introduction: 'wechatpay.scanqrcode',
    timeToPay: 'wechatpay.timetopay',
    buttonLabel: 'openApp',
    showAmount: true
};

export default QRLoader;
