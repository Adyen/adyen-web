import { h, RefObject } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import UPIComponent from './components/UPIComponent';
import Await from '../internal/Await';
import config from './config';
import QRLoader from '../internal/QRLoader';
import { UIElementStatus } from '../types';

const UPI_COLLECT = 'upi_collect';
const UPI_QR = 'upi_qr';

class UPI extends UIElement {
    public static type = 'upi';

    constructor(props: any) {
        super(props);
        this.handleGenerateQrCodeClick = this.handleGenerateQrCodeClick.bind(this);
    }

    get isValid() {
        return !!this.state.isValid;
    }

    formatData() {
        const { isQrCodeFlow, virtualPaymentAddress } = this.state.data;
        return {
            paymentMethod: {
                type: isQrCodeFlow ? UPI_QR : UPI_COLLECT,
                ...(virtualPaymentAddress && { virtualPaymentAddress })
            }
        };
    }

    public setStatus(status: UIElementStatus): this {
        this.componentRef?.setStatus(status, this.state.isQrCodeFlow);
        return this;
    }

    private handleGenerateQrCodeClick(): void {
        this.setState({ data: { isQrCodeFlow: true }, valid: {}, errors: {}, isValid: true });
        this.submit();
    }

    private renderContent(type: string) {
        switch (type) {
            case 'qrCode':
                return (
                    <QRLoader
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        // shouldRedirectOnMobile={this.props.shouldRedirectOnMobile}
                        type={UPI_QR}
                        brandLogo={this.props.brandLogo || this.icon}
                        // delay={this.props.delay}
                        onComplete={this.onComplete}
                        // countdownTime={this.props.countdownTime}
                        // instructions={this.props.instructions}
                    />
                );
            case 'await':
                return (
                    <Await
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        clientKey={this.props.clientKey}
                        paymentData={this.props.paymentData}
                        onError={this.handleError}
                        onComplete={this.onComplete}
                        brandLogo={this.icon}
                        type={UPI_COLLECT}
                        messageText={this.props.i18n.get(config.messageTextId)}
                        awaitText={this.props.i18n.get(config.awaitTextId)}
                        showCountdownTimer={config.showCountdownTimer}
                        delay={config.STATUS_INTERVAL}
                        countdownTime={config.COUNTDOWN_MINUTES}
                        throttleTime={config.THROTTLE_TIME}
                        throttleInterval={config.THROTTLE_INTERVAL}
                    />
                );
            default:
                return (
                    <UPIComponent
                        ref={(ref: RefObject<typeof UPIComponent>) => {
                            this.componentRef = ref;
                        }}
                        payButton={this.payButton}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        onGenerateQrCodeClick={this.handleGenerateQrCodeClick}
                    />
                );
        }
    }

    public render() {
        const { type } = this.props;
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.renderContent(type)}
            </CoreProvider>
        );
    }
}

export default UPI;
