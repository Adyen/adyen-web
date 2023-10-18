import { h, RefObject } from 'preact';
import UIElement from '../UIElement';
import UPIComponent from './components/UPIComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import Await from '../internal/Await';
import QRLoader from '../internal/QRLoader';
import { UPIElementProps, UpiMode, UpiPaymentData } from './types';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { TxVariants } from '../tx-variants';

class UPI extends UIElement<UPIElementProps> {
    public static type = TxVariants.upi;
    public static txVariants = [TxVariants.upi, TxVariants.upi_qr, TxVariants.upi_collect];

    private useQrCodeVariant: boolean;

    protected static defaultProps = {
        defaultMode: 'vpa'
    };

    public get isValid(): boolean {
        return this.useQrCodeVariant || !!this.state.isValid;
    }

    public formatData(): UpiPaymentData {
        const { virtualPaymentAddress } = this.state.data;
        return {
            paymentMethod: {
                type: this.useQrCodeVariant ? TxVariants.upi_qr : TxVariants.upi_collect,
                ...(virtualPaymentAddress && !this.useQrCodeVariant && { virtualPaymentAddress })
            }
        };
    }

    private onUpdateMode = (mode: UpiMode): void => {
        if (mode === 'qrCode') {
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
                        type={TxVariants.upi_qr}
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
                        type={TxVariants.upi_collect}
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
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>{this.renderContent(type)}</SRPanelProvider>
            </CoreProvider>
        );
    }
}

export default UPI;
