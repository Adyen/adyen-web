import { h, RefObject } from 'preact';
import UIElement from '../UIElement';
import UPIComponent from './components/UPIComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import Await from '../internal/Await';
import QRLoader from '../internal/QRLoader';
import { UIElementStatus } from '../types';

/**
 * 'upi' tx variant is the parent one.
 * 'upi_collect' and 'upi_qr' are the sub variants which are hardcoded
 */
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

    private renderContent(type: string): h.JSX.Element {
        switch (type) {
            case 'qrCode':
                return (
                    <QRLoader
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        type={UPI_QR}
                        brandLogo={this.props.brandLogo || this.icon}
                        onComplete={this.onComplete}
                        introduction={this.props.i18n.get('upi.qrCodeWaitingMessage')}
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
                        messageText={this.props.i18n.get('upi.vpaWaitingMessage')}
                        awaitText={this.props.i18n.get('await.waitForConfirmation')}
                        showCountdownTimer
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

    public render(): h.JSX.Element {
        const { type } = this.props;
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.renderContent(type)}
            </CoreProvider>
        );
    }
}

export default UPI;
