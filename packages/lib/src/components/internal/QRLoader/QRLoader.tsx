import { h } from 'preact';
import { AnalyticsInfoEvent } from '../../../core/Analytics/AnalyticsInfoEvent';
import { ANALYTICS_DOWNLOAD_STR, ANALYTICS_QR_CODE_DOWNLOAD } from '../../../core/Analytics/constants';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import {
    usePaymentStatusTimer,
    DEFAULT_PAYMENT_STATUS_TIMER_COUNTDOWN_TIME,
    DEFAULT_PAYMENT_STATUS_TIMER_DELAY,
    DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_INTERVAL,
    DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_TIME
} from '../../../hooks/usePaymentStatusTimer';
import useAutoFocus from '../../../utils/useAutoFocus';
import Button from '../Button';
import ContentSeparator from '../ContentSeparator';
import { CountdownTime } from '../Countdown/types';
import Spinner from '../Spinner';
import { QRDetails } from './components/QRDetails';
import { QRFinalState } from './components/QRFinalState';
import './QRLoader.scss';
import { QRLoaderDetailsProvider } from './QRLoaderDetailsProvider';
import { QRLoaderProps } from './types';
import { redirectToApp } from '../../../utils/urls';

const QRCODE_URL = 'utility/v1/barcode.png?type=qrCode&data=';

export function QRLoader(props: QRLoaderProps) {
    const { i18n, loadingContext } = useCoreContext();

    const { state: timerState, actions: timerActions } = usePaymentStatusTimer({
        paymentData: props.paymentData,
        clientKey: props.clientKey,
        delay: props.delay,
        throttleTime: props.throttleTime,
        throttleInterval: props.throttledInterval,
        type: props.type,
        onError: props.onError,
        onComplete: props.onComplete,
        onActionHandled: props.onActionHandled
    });

    const { completed, expired, loading, percentage } = timerState;
    const { onTick, onTimeUp } = timerActions;

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
    countdownTime: DEFAULT_PAYMENT_STATUS_TIMER_COUNTDOWN_TIME,
    delay: DEFAULT_PAYMENT_STATUS_TIMER_DELAY,
    throttleTime: DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_TIME,
    throttledInterval: DEFAULT_PAYMENT_STATUS_TIMER_THROTTLE_INTERVAL,
    onError: () => {},
    onComplete: () => {},
    classNameModifiers: [],
    introduction: 'wechatpay.scanqrcode',
    timeToPay: 'wechatpay.timetopay',
    buttonLabel: 'openApp',
    showAmount: true
};
