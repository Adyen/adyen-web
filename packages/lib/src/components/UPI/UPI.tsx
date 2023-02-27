import { h, RefObject } from 'preact';
import UIElement from '../UIElement';
import UPIComponent from './components/UPIComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import Await from '../internal/Await';
import QRLoader from '../internal/QRLoader';
import { UPIElementProps, UpiMode, UpiPaymentData } from './types';

/**
 * 'upi' tx variant is the parent one.
 * 'upi_collect' and 'upi_qr' are the sub variants which are submitted according to the shopper interaction.
 */
enum TX_VARIANT {
    UpiCollect = 'upi_collect',
    UpiQr = 'upi_qr'
}

class UPI extends UIElement<UPIElementProps> {
    public static type = 'upi';

    private useQrCodeVariant: boolean;

    protected static defaultProps = {
        defaultMode: UpiMode.Vpa
    };

    public get isValid(): boolean {
        return this.useQrCodeVariant || !!this.state.isValid;
    }

    public formatData(): UpiPaymentData {
        const { virtualPaymentAddress } = this.state.data;
        return {
            paymentMethod: {
                type: this.useQrCodeVariant ? TX_VARIANT.UpiQr : TX_VARIANT.UpiCollect,
                ...(virtualPaymentAddress && !this.useQrCodeVariant && { virtualPaymentAddress })
            }
        };
    }

    private onUpdateMode = (mode: UpiMode): void => {
        if (mode === UpiMode.QrCode) {
            this.useQrCodeVariant = true;
            /**
             * When selecting QR code mode, we need to clear the state data and trigger the 'onChange'.
             */
            this.setState({ data: {}, valid: {}, errors: {}, isValid: true });
        } else {
            this.useQrCodeVariant = false;
        }
    };

    private renderContent(type: string): h.JSX.Element {
        switch (type) {
            case 'qrCode':
                return (
                    <QRLoader
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        qrCodeData={this.props.qrCodeData ? encodeURIComponent(this.props.qrCodeData) : null}
                        type={TX_VARIANT.UpiQr}
                        brandLogo={this.props.brandLogo || this.icon}
                        onComplete={this.onComplete}
                        introduction={this.props.i18n.get('upi.qrCodeWaitingMessage')}
                        countdownTime={5}
                        onActionHandled={this.props.onActionHandled}
                    />
                );
            case 'await':
                return (
                    <Await
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        onError={this.props.onError}
                        clientKey={this.props.clientKey}
                        paymentData={this.props.paymentData}
                        onComplete={this.onComplete}
                        brandLogo={this.icon}
                        type={TX_VARIANT.UpiCollect}
                        messageText={this.props.i18n.get('upi.vpaWaitingMessage')}
                        awaitText={this.props.i18n.get('await.waitForConfirmation')}
                        showCountdownTimer
                        countdownTime={5}
                        onActionHandled={this.props.onActionHandled}
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
                        onUpdateMode={this.onUpdateMode}
                        defaultMode={this.props.defaultMode}
                        showPayButton={this.props.showPayButton}
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
