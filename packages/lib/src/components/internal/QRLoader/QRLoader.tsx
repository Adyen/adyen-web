import { Component, h } from 'preact';
import Countdown from '../Countdown';
import Button from '../Button';
import Spinner from '../Spinner';
import checkPaymentStatus from '../../../core/Services/payment-status';
import processResponse from '../../../core/ProcessResponse';

import './QRLoader.scss';
import { QRLoaderProps, QRLoaderState } from './types';
import copyToClipboard from '../../../utils/clipboard';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import useCoreContext from '../../../core/Context/useCoreContext';
import ContentSeparator from '../ContentSeparator';
import { StatusObject } from '../Await/types';
import useImage from '../../../core/Context/useImage';
import { useA11yReporter } from '../../../core/Errors/useA11yReporter';
import useAutoFocus from '../../../utils/useAutoFocus';

const QRCODE_URL = 'barcode.shtml?barcodeType=qrCode&fileType=png&data=';

class QRLoader extends Component<QRLoaderProps, QRLoaderState> {
    private interval;

    constructor(props) {
        super(props);

        this.state = {
            buttonStatus: 'default',
            completed: false,
            delay: props.delay,
            expired: false,
            loading: true,
            percentage: 100,
            timePassed: 0
        };
    }

    public static defaultProps = {
        delay: 2000,
        countdownTime: 15,
        onError: () => {},
        onComplete: () => {},
        throttleTime: 60000,
        classNameModifiers: [],
        throttledInterval: 10000,
        introduction: 'wechatpay.scanqrcode',
        timeToPay: 'wechatpay.timetopay',
        buttonLabel: 'openApp'
    };

    // Retry until getting a complete response from the server or it times out\
    // Changes interval time to 10 seconds after 1 minute (60 seconds)
    public statusInterval = () => {
        this.checkStatus();

        this.setState({ timePassed: this.state.timePassed + this.props.delay });

        if (this.state.timePassed >= this.props.throttleTime) {
            this.setState({ delay: this.props.throttledInterval });
        }
    };

    componentDidMount() {
        this.interval = setInterval(this.statusInterval, this.state.delay);
    }

    public redirectToApp = url => {
        window.location.assign(url);
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.delay !== this.state.delay) {
            clearInterval(this.interval);
            this.interval = setInterval(this.statusInterval, this.state.delay);
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    private onTick = (time): void => {
        this.setState({ percentage: time.percentage });
    };

    private onTimeUp = (): void => {
        this.setState({ expired: true });
        clearInterval(this.interval);
        this.props.onError(new AdyenCheckoutError('ERROR', 'Payment Expired'));
    };

    private onComplete = (status: StatusObject): void => {
        clearInterval(this.interval);
        this.setState({ completed: true, loading: false });

        const state = {
            data: {
                details: { payload: status.props.payload },
                paymentData: this.props.paymentData
            }
        };

        this.props.onComplete(state, this);
    };

    private onError = (status: StatusObject): void => {
        clearInterval(this.interval);
        this.setState({ expired: true, loading: false });

        if (status.props.payload) {
            const state = {
                data: {
                    details: { payload: status.props.payload },
                    paymentData: this.props.paymentData
                }
            };
            this.props.onComplete(state, this);
        }

        const error = new AdyenCheckoutError('ERROR', 'error result with no payload in response');
        return this.props.onError(error);
    };

    private checkStatus = () => {
        const { paymentData, clientKey, loadingContext } = this.props;

        return checkPaymentStatus(paymentData, clientKey, loadingContext)
            .then(processResponse)
            .catch(response => ({ type: 'network-error', props: response }))
            .then((status: StatusObject) => {
                switch (status.type) {
                    case 'success':
                        this.onComplete(status);
                        break;
                    case 'error':
                        this.onError(status);
                        break;
                    default:
                        this.setState({ loading: false });
                }
                return status;
            });
    };

    render({ amount, url, brandLogo, brandName, countdownTime, type, onActionHandled }: QRLoaderProps, { expired, completed, loading }) {
        const { i18n, loadingContext } = useCoreContext();
        const getImage = useImage();
        const qrCodeImage = this.props.qrCodeData ? `${loadingContext}${QRCODE_URL}${this.props.qrCodeData}` : this.props.qrCodeImage;
        const finalState = (image, message) => {
            const status = i18n.get(message);
            useA11yReporter(status);
            return (
                <div className="adyen-checkout__qr-loader adyen-checkout__qr-loader--result">
                    <img
                        className="adyen-checkout__qr-loader__icon adyen-checkout__qr-loader__icon--result"
                        src={getImage({ imageFolder: 'components/' })(image)}
                        alt={status}
                    />
                    <div className="adyen-checkout__qr-loader__subtitle adyen-checkout__qr-loader__subtitle--result">{status}</div>
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
                    {brandLogo && <img alt={brandName} src={brandLogo} className="adyen-checkout__qr-loader__brand-logo" />}
                    <Spinner />
                </div>
            );
        }

        const timeToPayString = i18n.get(this.props.timeToPay).split('%@');

        const qrSubtitleRef = useAutoFocus();

        return (
            <div
                className={`
                    adyen-checkout__qr-loader
                    adyen-checkout__qr-loader--${type}
                    ${this.props.classNameModifiers.map(m => `adyen-checkout__qr-loader--${m}`)}
                `}
            >
                {brandLogo && <img src={brandLogo} alt={brandName} className="adyen-checkout__qr-loader__brand-logo" />}

                {amount && amount.value && amount.currency && (
                    <div className="adyen-checkout__qr-loader__payment_amount">{i18n.amount(amount.value, amount.currency)}</div>
                )}

                {url && (
                    <div className="adyen-checkout__qr-loader__app-link">
                        {this.props.redirectIntroduction && (
                            <div className="adyen-checkout__qr-loader__subtitle">{i18n.get(this.props.redirectIntroduction)}</div>
                        )}
                        <Button classNameModifiers={['qr-loader']} onClick={() => this.redirectToApp(url)} label={i18n.get(this.props.buttonLabel)} />
                        <ContentSeparator />
                    </div>
                )}

                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                <div ref={qrSubtitleRef} tabIndex={0} className="adyen-checkout__qr-loader__subtitle">
                    {i18n.get(this.props.introduction)}
                </div>

                <img
                    src={qrCodeImage}
                    alt={i18n.get('wechatpay.scanqrcode')}
                    onLoad={() => {
                        onActionHandled?.({ componentType: this.props.type, actionDescription: 'qr-code-loaded' });
                    }}
                />

                <div className="adyen-checkout__qr-loader__progress">
                    <span className="adyen-checkout__qr-loader__percentage" style={{ width: `${this.state.percentage}%` }} />
                </div>

                <div className="adyen-checkout__qr-loader__countdown">
                    {timeToPayString[0]}&nbsp;
                    <Countdown minutesFromNow={countdownTime} onTick={this.onTick} onCompleted={this.onTimeUp} />
                    &nbsp;{timeToPayString[1]}
                </div>

                {typeof this.props.instructions === 'string' ? (
                    <div className="adyen-checkout__qr-loader__instructions">{i18n.get(this.props.instructions)}</div>
                ) : (
                    this.props.instructions?.()
                )}

                {this.props.copyBtn && (
                    <div className="adyen-checkout__qr-loader__actions">
                        <Button
                            inline
                            variant="action"
                            onClick={(e, { complete }) => {
                                copyToClipboard(this.props.qrCodeData);
                                complete();
                            }}
                            icon={getImage({ imageFolder: 'components/' })('copy')}
                            label={i18n.get('button.copy')}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default QRLoader;
