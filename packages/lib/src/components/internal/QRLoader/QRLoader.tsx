import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import Button from '../Button';
import Spinner from '../Spinner';
import checkPaymentStatus from '../../../core/Services/payment-status';
import processResponse from '../../../core/ProcessResponse';
import { QRLoaderProps } from './types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import ContentSeparator from '../ContentSeparator';
import { StatusObject } from '../Await/types';
import useAutoFocus from '../../../utils/useAutoFocus';
import { ANALYTICS_DOWNLOAD_STR, ANALYTICS_QR_CODE_DOWNLOAD } from '../../../core/Analytics/constants';
import { AnalyticsInfoEvent } from '../../../core/Analytics/AnalyticsInfoEvent';
import { CountdownTime } from '../Countdown/types';
import { QRDetails } from './components/QRDetails';
import { QRLoaderDetailsProvider } from './QRLoaderDetailsProvider';
import { QRFinalState } from './components/QRFinalState';
import './QRLoader.scss';

const QRCODE_URL = 'utility/v1/barcode.png?type=qrCode&data=';

export function QRLoader(props: QRLoaderProps) {
    const { i18n, loadingContext } = useCoreContext();
    const [completed, setCompleted] = useState(false);
    const [delay, setDelay] = useState(props.delay);
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [percentage, setPercentage] = useState(100);
    const [timePassed, setTimePassed] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | number | null>(null);

    const redirectToApp = (url: string | URL): void => {
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
        setCompleted(true);
        setLoading(false);

        const state = {
            data: {
                details: { payload: status.props.payload },
                paymentData: props.paymentData
            }
        };

        props.onComplete(state);
    };

    const onError = (status: StatusObject): void => {
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
        }

        const error = new AdyenCheckoutError('ERROR', 'error result with no payload in response');
        props.onError(error);
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

            if (actualTimePassed >= props.throttleTime && currentDelay !== props.throttledInterval) {
                setDelay(props.throttledInterval);
                currentDelay = props.throttledInterval;
            }
        };

        timeoutRef.current = setTimeout(() => {
            void statusInterval();
        }, currentDelay);

        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, [expired, completed, loading, delay, props.throttleTime, timePassed]);

    const { amount, showAmount, url, brandLogo, brandName, countdownTime, type, onActionHandled } = props;

    const qrCodeImage = props.qrCodeData ? `${loadingContext}${QRCODE_URL}${props.qrCodeData}&clientKey=${props.clientKey}` : props.qrCodeImage;

    const handleCopy = () => {
        const event = new AnalyticsInfoEvent({
            type: ANALYTICS_DOWNLOAD_STR,
            target: ANALYTICS_QR_CODE_DOWNLOAD
        });
        props.onSubmitAnalytics(event);
    };

    const onQrCodeLoad = () => {
        onActionHandled?.({
            componentType: props.type,
            actionDescription: 'qr-code-loaded'
        });
    };

    const qrSubtitleRef = useAutoFocus();

    if (expired) {
        return <QRFinalState image="error" message={i18n.get('error.subtitle.payment')} />;
    }

    if (completed) {
        return <QRFinalState image="success" message={i18n.get('creditCard.success')} />;
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
                    {props.redirectIntroduction && <p className="adyen-checkout__qr-loader__subtitle">{i18n.get(props.redirectIntroduction)}</p>}
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
    delay: 2_000,
    countdownTime: 15,
    onError: () => {},
    onComplete: () => {},
    throttleTime: 60_000,
    classNameModifiers: [],
    throttledInterval: 10_000,
    introduction: 'wechatpay.scanqrcode',
    timeToPay: 'wechatpay.timetopay',
    buttonLabel: 'openApp',
    showAmount: true
};
